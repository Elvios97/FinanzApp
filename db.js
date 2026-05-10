// ═══════════════════════════════════════════════════════════════
// db.js — Datenmodell & localStorage Persistenz
// ═══════════════════════════════════════════════════════════════

const DB_KEY = "meingeld_v3";

// ── Default State ────────────────────────────────────────────────
function defaultState() {
  return {
    currentMonth: currentMonthKey(),
    months: {},   // { "2025-05": { income: 0, entries: [] } }
    goals: [],
  };
}

// ── Month Helpers ────────────────────────────────────────────────
function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key) {
  const [y, m] = key.split("-");
  const date = new Date(parseInt(y), parseInt(m) - 1, 1);
  return date.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
}

function ensureMonth(state, key) {
  if (!state.months[key]) {
    state.months[key] = { income: 0, entries: [] };
  }
}

// ── Persistence ──────────────────────────────────────────────────
function saveState(state) {
  try { localStorage.setItem(DB_KEY, JSON.stringify(state)); } catch (_) {}
}

function loadState() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultState(), ...parsed };
    }
  } catch (_) {}
  return defaultState();
}

// ── Entry CRUD ───────────────────────────────────────────────────
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function createEntry({ name, amount, type, category, date, note, source }) {
  return {
    id:       generateId(),
    name:     name || "Unbekannt",
    amount:   parseFloat(amount) || 0,
    type:     type || "fun",           // fixed | fun | saving | income
    category: category || name || "Sonstiges",
    date:     date || new Date().toISOString().slice(0, 10),
    note:     note || "",
    source:   source || "manual",      // manual | imported
    createdAt: Date.now(),
  };
}

function addEntry(state, monthKey, entryData) {
  ensureMonth(state, monthKey);
  const entry = createEntry(entryData);
  state.months[monthKey].entries.push(entry);
  return entry;
}

function updateEntry(state, monthKey, id, updates) {
  ensureMonth(state, monthKey);
  const idx = state.months[monthKey].entries.findIndex(e => e.id === id);
  if (idx !== -1) {
    state.months[monthKey].entries[idx] = {
      ...state.months[monthKey].entries[idx],
      ...updates,
    };
  }
}

function deleteEntry(state, monthKey, id) {
  ensureMonth(state, monthKey);
  state.months[monthKey].entries = state.months[monthKey].entries.filter(e => e.id !== id);
}

function mergeCategories(state, monthKey, fromName, toName) {
  ensureMonth(state, monthKey);
  state.months[monthKey].entries.forEach(e => {
    if (e.category === fromName) e.category = toName;
    if (e.name === fromName) e.name = toName;
  });
}

function importEntries(state, monthKey, { income, categories }) {
  ensureMonth(state, monthKey);
  // Remove old imported entries
  state.months[monthKey].entries = state.months[monthKey].entries.filter(
    e => e.source !== "imported"
  );
  if (income) state.months[monthKey].income = income;
  (categories || []).forEach(c => {
    addEntry(state, monthKey, {
      name:     c.name,
      amount:   c.amount,
      type:     c.type,
      category: c.name,
      source:   "imported",
    });
  });
}

// ── Computed / Aggregates ────────────────────────────────────────
function getMonthData(state, monthKey) {
  ensureMonth(state, monthKey);
  const { income, entries } = state.months[monthKey];
  const fixed   = entries.filter(e => e.type === "fixed").reduce((s, e) => s + e.amount, 0);
  const fun     = entries.filter(e => e.type === "fun").reduce((s, e) => s + e.amount, 0);
  const saving  = entries.filter(e => e.type === "saving").reduce((s, e) => s + e.amount, 0);
  const totalOut = fixed + fun + saving;
  const remaining = income - totalOut;
  return { income, entries, fixed, fun, saving, totalOut, remaining };
}

function getAvailableMonths(state) {
  return Object.keys(state.months).sort().reverse();
}

// ── Goals CRUD ───────────────────────────────────────────────────
function addGoal(state, { name, icon, target, saved, monthly }) {
  const goal = { id: generateId(), name, icon: icon || "💰", target: parseFloat(target) || 0, saved: parseFloat(saved) || 0, monthly: parseInt(monthly) || 50 };
  state.goals.push(goal);
  return goal;
}

function updateGoal(state, id, updates) {
  const idx = state.goals.findIndex(g => g.id === id);
  if (idx !== -1) state.goals[idx] = { ...state.goals[idx], ...updates };
}

function deleteGoal(state, id) {
  state.goals = state.goals.filter(g => g.id !== id);
}

// ── Export for KI ────────────────────────────────────────────────
function buildKiExport(state, monthKey) {
  const data = getMonthData(state, monthKey);
  const label = monthLabel(monthKey);
  const json = JSON.stringify({
    monat: label,
    einkommen: data.income,
    kategorien: data.entries.map(e => ({
      name: e.name,
      betrag: e.amount,
      typ: e.type,
      quelle: e.source,
    })),
    zusammenfassung: {
      fixkosten: data.fixed,
      freizeit: data.fun,
      sparen: data.saving,
      verfügbar: data.remaining,
    }
  }, null, 2);

  return `Analysiere meine Finanzen für den Monat ${label}.

Bitte gib mir:
1. eine kurze Zusammenfassung
2. auffällige Ausgaben
3. mögliche Sparpotenziale
4. eine Einschätzung meiner Fixkosten
5. eine Einschätzung meiner Freizeit-Ausgaben
6. konkrete Vorschläge für den nächsten Monat
7. eine einfache Bewertung meiner finanziellen Situation

Hier sind meine Finanzdaten:

${json}`;
}

// ── Import Prompt ────────────────────────────────────────────────
const IMPORT_PROMPT = `Analysiere diesen Kontoauszug und gib mir NUR ein JSON-Objekt zurück.
Kein erklärender Text, keine Markdown-Backticks, nur reines JSON.

Gewünschtes Format:
{
  "income": <Gesamteinnahmen als Zahl>,
  "categories": [
    { "name": "<Kategoriename>", "amount": <Betrag als positive Zahl>, "type": "<fixed|fun|saving>" }
  ]
}

Regeln:
- Fasse ähnliche Buchungen zusammen (z.B. alle Supermärkte → "Lebensmittel")
- "amount" ist immer positiv (Ausgabebetrag)
- "type": fixed = Fixkosten, fun = Freizeit & Shopping, saving = Sparbeiträge
- Einnahmen (Gehalt) NUR in "income", nicht in categories
- Maximal 12 Kategorien, Kleinbeträge unter "Sonstiges"
- Antworte ausschließlich mit dem JSON-Objekt`;
