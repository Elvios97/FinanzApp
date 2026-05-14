// ═══════════════════════════════════════════════════════════════
// db.js — Datenmodell & localStorage Persistenz
// ═══════════════════════════════════════════════════════════════

const DB_KEY = "meingeld_v3";
const ENTRY_TYPES = ["fixed", "fun", "saving", "income"];
const DEFAULT_ENTRY_TYPE = "fun";

// ── Default State ────────────────────────────────────────────────
function defaultState() {
  return {
    currentMonth: currentMonthKey(),
    months: {},   // { "2025-05": { income: 0, entries: [] } }
    goals: [],
    theme: "dark", // "dark" | "light"
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

function parsePositiveNumber(value) {
  return Math.abs(parseFloat(value) || 0);
}

function normalizeEntryType(type) {
  const value = String(type || "").trim().toLowerCase();
  const aliases = {
    fixkosten: "fixed",
    fixedcost: "fixed",
    fixed_cost: "fixed",
    freizeit: "fun",
    sparen: "saving",
    sparbetrag: "saving",
    savings: "saving",
    einnahme: "income",
    einnahmen: "income",
    revenue: "income",
  };
  return aliases[value] || (ENTRY_TYPES.includes(value) ? value : DEFAULT_ENTRY_TYPE);
}

function normalizeState(state) {
  Object.values(state.months || {}).forEach(month => {
    month.income = parseFloat(month.income) || 0;
    month.entries = (month.entries || []).map(entry => ({
      ...entry,
      amount: parsePositiveNumber(entry.amount),
      type: normalizeEntryType(entry.type),
    }));
  });
  return state;
}

function loadState() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return normalizeState({ ...defaultState(), ...parsed });
    }
  } catch (_) {}
  return defaultState();
}

// ── Entry CRUD ───────────────────────────────────────────────────
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function createEntry(data) {
  const name = data.name || data.titel;
  const amount = data.amount ?? data.betrag;
  const type = data.type ?? data.typ;
  const category = data.category ?? data.kategorie;
  const date = data.date ?? data.datum;
  const note = data.note ?? data.notiz;
  const source = data.source ?? data.quelle;

  return {
    id:       generateId(),
    name:     name || "Unbekannt",
    amount:   parsePositiveNumber(amount),
    type:     normalizeEntryType(type), // fixed | fun | saving | income
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
    if (updates.type) updates.type = normalizeEntryType(updates.type);
    if (updates.amount !== undefined) updates.amount = parsePositiveNumber(updates.amount);
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
      amount:   c.amount ?? c.betrag,
      type:     c.type ?? c.typ,
      category: c.category ?? c.kategorie ?? c.name,
      date:     c.date ?? c.datum,
      note:     c.note ?? c.notiz,
      source:   "imported",
    });
  });
}

// ── Computed / Aggregates ────────────────────────────────────────
function getMonthData(state, monthKey) {
  ensureMonth(state, monthKey);
  const { entries } = state.months[monthKey];
  const baseIncome = parseFloat(state.months[monthKey].income) || 0;
  const totals = entries.reduce((result, entry) => {
    const type = normalizeEntryType(entry.type);
    result[type] += parseFloat(entry.amount) || 0;
    return result;
  }, { fixed: 0, fun: 0, saving: 0, income: 0 });

  const { fixed, fun, saving } = totals;
  const extraIncome = totals.income;
  const income = baseIncome + extraIncome;
  const expenses = fixed + fun;
  const totalOut = expenses + saving;
  const remaining = income - totalOut;
  return { income, baseIncome, extraIncome, entries, fixed, fun, saving, expenses, totalOut, remaining };
}

function getAvailableMonths(state) {
  return Object.keys(state.months).sort().reverse();
}

// ── Goals CRUD ───────────────────────────────────────────────────
function addGoal(state, { name, icon, target, saved, monthly, durationMonths }) {
  const goal = {
    id: generateId(),
    name,
    icon: icon || "💰",
    target: parseFloat(target) || 0,
    saved: parseFloat(saved) || 0,
    monthly: parseInt(monthly) || 50,
    durationMonths: durationMonths || null,
  };
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
    einnahmen: {
      fest: data.baseIncome,
      zusatz: data.extraIncome,
      gesamt: data.income,
    },
    ausgaben: {
      fixkosten: data.fixed,
      freizeit: data.fun,
      sparen: data.saving,
      gesamt: data.totalOut,
    },
    verfügbar: data.remaining,
    kategorien: data.entries.map(e => ({
      name: e.name,
      betrag: e.amount,
      typ: e.type,
      quelle: e.source,
    })),
    zusammenfassung: {
      monatliches_einkommen: data.baseIncome,
      weitere_einnahmen: data.extraIncome,
      gesamte_einnahmen: data.income,
      fixkosten: data.fixed,
      freizeit: data.fun,
      sparen: data.saving,
      ausgaben_ohne_sparen: data.expenses,
      ausgaben_und_sparen: data.totalOut,
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
    { "name": "<Kategoriename>", "amount": <Betrag als positive Zahl>, "type": "<fixed|fun|saving|income>" }
  ]
}

Regeln:
- Fasse ähnliche Buchungen zusammen (z.B. alle Supermärkte → "Lebensmittel")
- "amount" ist immer positiv (Betrag)
- "type": fixed = Fixkosten, fun = Freizeit & Shopping, saving = Sparbeiträge, income = zusätzliche Einnahmen
- Regelmäßiges Gehalt NUR in "income"; einzelne zusätzliche Einnahmen dürfen als category mit "type": "income" erscheinen
- Maximal 12 Kategorien, Kleinbeträge unter "Sonstiges"
- Antworte ausschließlich mit dem JSON-Objekt`;
