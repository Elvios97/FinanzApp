// ═══════════════════════════════════════════════════════════════
// app.js — MeinGeld v3 · Application Logic
// ═══════════════════════════════════════════════════════════════

// ── Icon Map ─────────────────────────────────────────────────────
const ICONS = {
  miete:"🏠", wohnen:"🏠", nebenkosten:"💡", strom:"💡", internet:"📡",
  lebensmittel:"🛒", supermarkt:"🛒", rewe:"🛒", aldi:"🛒", lidl:"🛒", edeka:"🛒",
  transport:"🚇", öpnv:"🚇", db:"🚂", bahn:"🚂", auto:"🚗", tanken:"⛽", parken:"🅿️",
  versicherung:"🛡️", kranken:"💊", gesundheit:"💊", arzt:"🏥", apotheke:"💊",
  hobbys:"🎸", sport:"🏃", fitness:"🏋️", freizeit:"🎉", unterhaltung:"🎬", kino:"🎬",
  essen:"🍜", restaurant:"🍜", lieferservice:"🛵", lieferando:"🛵", uber:"🛵",
  kleidung:"👗", shopping:"🛍️", amazon:"📦", online:"📦",
  sparen:"💰", rücklagen:"🏦", invest:"📈",
  gehalt:"💼", lohn:"💼", einkommen:"💼",
  streaming:"📺", netflix:"📺", spotify:"🎵", musik:"🎵",
  telefon:"📱", handy:"📱", mobilfunk:"📱",
  steuern:"🏛️", kredit:"💳", darlehen:"💳",
  urlaub:"✈️", reise:"✈️", hotel:"🏨",
  sonstiges:"📌", bar:"💵", paypal:"💳",
};

function iconFor(name) {
  if (!name) return "📌";
  const low = name.toLowerCase();
  for (const [k, v] of Object.entries(ICONS)) if (low.includes(k)) return v;
  return "📌";
}

const TYPE_CFG = {
  fixed:  { color: "var(--col-fixed)",  label: "Fixkosten",  bg: "#2a200a" },
  fun:    { color: "var(--col-fun)",    label: "Freizeit",   bg: "#2a1f00" },
  saving: { color: "var(--col-saving)", label: "Sparen",     bg: "#0f2018" },
};

// ── State ─────────────────────────────────────────────────────────
let state = loadState();
let activeFilter = "all";
let activeSort   = "amount-desc";
let editEntryId  = null;
let editGoalId   = null;

// ── Navigation ────────────────────────────────────────────────────
function switchScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("screen-" + id).classList.add("active");
  const navBtn = document.getElementById("nav-" + id);
  if (navBtn) navBtn.classList.add("active");

  if (id === "overview")  renderOverview();
  if (id === "history")   renderHistory();
  if (id === "sparplan")  renderSparplan();
  if (id === "settings")  renderSettings();
  if (id === "import")    renderImport();
}

// ── Render Overview ───────────────────────────────────────────────
function renderOverview() {
  const mk   = state.currentMonth;
  const data = getMonthData(state, mk);
  const fmt  = n => Math.round(Math.abs(n)).toLocaleString("de-DE") + " €";
  const { income, fixed, fun, saving, remaining } = data;

  const remCol = remaining < 0 ? "var(--red)" : remaining < income * .08 ? "var(--yellow)" : "var(--green)";

  // Income bar
  document.getElementById("overview-income").textContent = income > 0 ? fmt(income) : "– €";
  document.getElementById("overview-month").textContent  = monthLabel(mk);

  // Ring
  const CIRC = 389.6;
  const arc  = v => income > 0 ? (v / income) * CIRC : 0;
  const fixD = arc(fixed), funD = arc(fun), savD = arc(saving);
  const remD = arc(Math.max(0, remaining));

  const setArc = (id, d, off, col) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.strokeDasharray  = `${d} ${CIRC}`;
    el.style.strokeDashoffset = `-${off}`;
    if (col) el.style.stroke = col;
  };
  setArc("arc-fixed",  fixD, 0,                    null);
  setArc("arc-fun",    funD, fixD,                  null);
  setArc("arc-saving", savD, fixD + funD,           null);
  setArc("arc-remain", remD, fixD + funD + savD,    remCol);

  const rv = document.getElementById("ring-remain-val");
  rv.textContent = income > 0 ? (remaining >= 0 ? "+" : "-") + fmt(remaining) : "– €";
  rv.style.color = income > 0 ? remCol : "var(--muted)";

  // Stats
  document.getElementById("stat-fixed").textContent  = fmt(fixed);
  document.getElementById("stat-fun").textContent    = fmt(fun);
  document.getElementById("stat-saving").textContent = fmt(saving);

  // Highlight
  const hlCard = document.getElementById("hl-card");
  const hlVal  = document.getElementById("hl-val");
  const hlSub  = document.getElementById("hl-sub");
  if (income === 0) {
    hlCard.style.cssText = "background:linear-gradient(135deg,#0f2018,#0c0b0a);border:1px solid #2a5a3a;";
    hlVal.style.color = "var(--muted)"; hlVal.textContent = "– €";
    hlSub.style.color = "var(--muted)"; hlSub.textContent = "Einkommen eintragen oder Kontoauszug importieren →";
  } else if (remaining < 0) {
    hlCard.style.cssText = "background:linear-gradient(135deg,#2a0808,#0c0b0a);border:1px solid #5a1f1f;";
    hlVal.style.color = "var(--red)"; hlVal.textContent = "-" + fmt(remaining);
    hlSub.style.color = "var(--red)"; hlSub.textContent = "⚠️ Ausgaben übersteigen Einnahmen!";
  } else {
    hlCard.style.cssText = "background:linear-gradient(135deg,#0f2018,#0c0b0a);border:1px solid #2a5a3a;";
    hlVal.style.color = "var(--green)"; hlVal.textContent = "+" + fmt(remaining);
    hlSub.style.color = "#4caf82";
    const pct = income > 0 ? Math.round((remaining / income) * 100) : 0;
    hlSub.textContent = `${pct}% frei · ${Math.round(remaining / 4).toLocaleString("de-DE")} € / Woche`;
  }

  renderEntryList();
}

// ── Entry List with Filter + Sort ─────────────────────────────────
function renderEntryList() {
  const mk      = state.currentMonth;
  const data    = getMonthData(state, mk);
  let   entries = [...data.entries];
  const income  = data.income;

  // Filter
  const filterMap = {
    "all":      () => true,
    "fixed":    e => e.type === "fixed",
    "fun":      e => e.type === "fun",
    "saving":   e => e.type === "saving",
    "manual":   e => e.source === "manual",
    "imported": e => e.source === "imported",
  };
  entries = entries.filter(filterMap[activeFilter] || (() => true));

  // Sort
  const sortMap = {
    "amount-desc": (a, b) => b.amount - a.amount,
    "amount-asc":  (a, b) => a.amount - b.amount,
    "name-asc":    (a, b) => a.name.localeCompare(b.name, "de"),
    "name-desc":   (a, b) => b.name.localeCompare(a.name, "de"),
    "date-desc":   (a, b) => (b.date || "").localeCompare(a.date || ""),
    "date-asc":    (a, b) => (a.date || "").localeCompare(b.date || ""),
    "type":        (a, b) => a.type.localeCompare(b.type),
  };
  entries.sort(sortMap[activeSort] || sortMap["amount-desc"]);

  const list = document.getElementById("entry-list");
  list.innerHTML = "";

  if (!entries.length) {
    list.innerHTML = `<div class="entry-empty">
      ${activeFilter === "all"
        ? "Noch keine Einträge.<br>Tippe auf <strong>+</strong> um manuell einzutragen<br>oder importiere einen Kontoauszug."
        : "Keine Einträge für diesen Filter."}
    </div>`;
    return;
  }

  entries.forEach(entry => {
    const cfg  = TYPE_CFG[entry.type] || TYPE_CFG.fun;
    const pct  = income > 0 ? Math.min(100, (entry.amount / income) * 100) : 0;
    const icon = iconFor(entry.name);
    const dateStr = entry.date ? new Date(entry.date).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }) : "";

    const el = document.createElement("div");
    el.className = "entry-row";
    el.innerHTML = `
      <div class="entry-dot" style="background:${cfg.color}"></div>
      <div class="entry-ico">${icon}</div>
      <div class="entry-info">
        <div class="entry-name">${entry.name}</div>
        <div class="entry-meta">
          <span class="entry-type-badge" style="background:${cfg.bg};color:${cfg.color}">${cfg.label}</span>
          ${dateStr ? `<span class="entry-date">${dateStr}</span>` : ""}
          <span class="entry-source-badge">${entry.source === "manual" ? "✎ manuell" : "⬇ import"}</span>
        </div>
        ${entry.note ? `<div class="entry-note">${entry.note}</div>` : ""}
        <div class="entry-bar"><div class="entry-bar-fill" style="width:${pct}%;background:${cfg.color}"></div></div>
      </div>
      <div class="entry-amt" style="color:${cfg.color}">${entry.amount.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €</div>
    `;
    el.addEventListener("pointerdown", () => {
      console.log('Entry tapped:', entry.name);
      openEditEntryModal(entry);
    });
    list.appendChild(el);
  });
}

// ── Filter + Sort UI ──────────────────────────────────────────────
function setFilter(f) {
  activeFilter = f;
  document.querySelectorAll(".filter-chip").forEach(c => {
    c.classList.toggle("active", c.dataset.filter === f);
  });
  renderEntryList();
}

function setSort(val) {
  activeSort = val;
  renderEntryList();
}

// ── Import Screen ─────────────────────────────────────────────────
function renderImport() {
  document.getElementById("import-prompt-text").textContent = IMPORT_PROMPT;
}

function copyImportPrompt() {
  copyToClipboard(IMPORT_PROMPT, "import-copy-feedback");
}

function runImport() {
  const raw = document.getElementById("json-paste").value.trim();
  hideEl("import-error"); hideEl("import-success");

  if (!raw) { showImportError("Bitte zuerst das JSON einfügen."); return; }

  let parsed;
  try {
    parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch (_) {
    showImportError("Ungültiges JSON. Kopiere die vollständige KI-Antwort.");
    return;
  }

  if (!parsed.income || !Array.isArray(parsed.categories)) {
    showImportError("Format stimmt nicht. Fehlende Felder: income oder categories.");
    return;
  }

  importEntries(state, state.currentMonth, parsed);
  saveState(state);

  document.getElementById("import-success-msg").textContent =
    `${parsed.categories.length} Kategorien importiert · Einkommen: ${Math.round(parsed.income).toLocaleString("de-DE")} €`;
  showEl("import-success");
  document.getElementById("json-paste").value = "";

  setTimeout(() => switchScreen("overview"), 1200);
}

function showImportError(msg) {
  document.getElementById("import-error-msg").textContent = msg;
  showEl("import-error");
}

// ── Manual Entry Modal ─────────────────────────────────────────────
function openAddEntryModal() {
  editEntryId = null;
  document.getElementById("entry-modal-title").textContent = "Neuer Eintrag";
  document.getElementById("entry-name").value     = "";
  document.getElementById("entry-amount").value   = "";
  document.getElementById("entry-category").value = "";
  document.getElementById("entry-date").value     = new Date().toISOString().slice(0, 10);
  document.getElementById("entry-note").value     = "";
  setEntryType("fun");
  hideEl("entry-delete-btn");
  openModal("modal-entry");
}

function openEditEntryModal(entry) {
  editEntryId = entry.id;
  document.getElementById("entry-modal-title").textContent = "Eintrag bearbeiten";
  document.getElementById("entry-name").value     = entry.name;
  document.getElementById("entry-amount").value   = entry.amount;
  document.getElementById("entry-category").value = entry.category || "";
  document.getElementById("entry-date").value     = entry.date || new Date().toISOString().slice(0, 10);
  document.getElementById("entry-note").value     = entry.note || "";
  setEntryType(entry.type);
  showEl("entry-delete-btn");
  openModal("modal-entry");
}

function setEntryType(type) {
  document.querySelectorAll(".type-chip").forEach(c => {
    c.className = "type-chip";
    if (c.dataset.type === type) c.classList.add("active-" + type);
  });
  document.getElementById("entry-type-hidden").value = type;
}

function saveEntry() {
  const name     = document.getElementById("entry-name").value.trim();
  const amount   = parseFloat(document.getElementById("entry-amount").value);
  const category = document.getElementById("entry-category").value.trim() || name;
  const date     = document.getElementById("entry-date").value;
  const note     = document.getElementById("entry-note").value.trim();
  const type     = document.getElementById("entry-type-hidden").value;

  if (!name || isNaN(amount) || amount <= 0) {
    alert("Bitte Name und gültigen Betrag eingeben."); return;
  }

  if (editEntryId) {
    updateEntry(state, state.currentMonth, editEntryId, { name, amount, category, date, note, type });
  } else {
    addEntry(state, state.currentMonth, { name, amount, category, date, note, type, source: "manual" });
  }

  saveState(state);
  closeModal("modal-entry");
  renderOverview();
}

function deleteCurrentEntry() {
  if (!editEntryId) return;
  if (!confirm("Eintrag wirklich löschen?")) return;
  deleteEntry(state, state.currentMonth, editEntryId);
  saveState(state);
  closeModal("modal-entry");
  renderOverview();
}

// ── Income Modal ──────────────────────────────────────────────────
function openIncomeModal() {
  const mk = state.currentMonth;
  ensureMonth(state, mk);
  document.getElementById("income-modal-input").value = state.months[mk].income || "";
  openModal("modal-income");
}

function saveIncome() {
  const v = parseFloat(document.getElementById("income-modal-input").value);
  if (v > 0) {
    ensureMonth(state, state.currentMonth);
    state.months[state.currentMonth].income = v;
    saveState(state);
    renderOverview();
    renderSettings();
  }
  closeModal("modal-income");
}

// ── History Screen ────────────────────────────────────────────────
function renderHistory() {
  const months  = getAvailableMonths(state);
  const current = state.currentMonth;
  const container = document.getElementById("month-list");
  container.innerHTML = "";

  if (!months.length) {
    container.innerHTML = `<div class="entry-empty">Noch keine Monatsdaten vorhanden.</div>`;
    return;
  }

  months.forEach(mk => {
    const data    = getMonthData(state, mk);
    const isCurr  = mk === current;
    const remCol  = data.remaining < 0 ? "var(--red)" : data.remaining < data.income * .08 ? "var(--yellow)" : "var(--green)";
    const el      = document.createElement("div");
    el.className  = "month-card" + (isCurr ? " current" : "");
    el.innerHTML  = `
      <div class="month-card-left">
        <div class="month-card-name">${monthLabel(mk)}${isCurr ? " <span style='color:var(--green);font-size:11px'>●</span>" : ""}</div>
        <div class="month-card-entries">${data.entries.length} Einträge</div>
      </div>
      <div class="month-card-right">
        <div class="month-card-remain" style="color:${remCol}">${data.remaining >= 0 ? "+" : ""}${Math.round(data.remaining).toLocaleString("de-DE")} €</div>
        <div class="month-card-income">${Math.round(data.income).toLocaleString("de-DE")} € Einnahmen</div>
      </div>
    `;
    el.addEventListener("pointerdown", () => {
      console.log('Month card tapped:', mk);
      state.currentMonth = mk;
      saveState(state);
      switchScreen("overview");
    });
    container.appendChild(el);
  });
}

function openNewMonthModal() {
  const now = new Date();
  document.getElementById("new-month-input").value =
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  openModal("modal-new-month");
}

function saveNewMonth() {
  const val = document.getElementById("new-month-input").value;
  if (!val || !/^\d{4}-\d{2}$/.test(val)) { alert("Ungültiges Format. Bitte YYYY-MM eingeben."); return; }
  ensureMonth(state, val);
  state.currentMonth = val;
  saveState(state);
  closeModal("modal-new-month");
  switchScreen("overview");
}

// ── Sparplan ──────────────────────────────────────────────────────
function renderSparplan() {
  const goals = state.goals;
  const total = goals.reduce((s, g) => s + (g.monthly || 0), 0);
  document.getElementById("sp-total-val").textContent = total.toLocaleString("de-DE") + " € / Mo";
  document.getElementById("sp-total-sub").textContent = total > 0
    ? `${goals.length} aktive${goals.length === 1 ? "s" : ""} Ziel${goals.length === 1 ? "" : "e"} · ${(total * 12).toLocaleString("de-DE")} € / Jahr`
    : "Füge dein erstes Sparziel hinzu";

  const container = document.getElementById("sp-goals");
  container.innerHTML = "";

  goals.forEach((g) => {
    const target  = g.target  || 1;
    const saved   = g.saved   || 0;
    const monthly = g.monthly || 0;
    const left    = Math.max(0, target - saved);
    const months  = monthly > 0 ? Math.ceil(left / monthly) : null;
    const pct     = Math.min(100, Math.round((saved / target) * 100));

    // Finish date
    let finishStr = "–";
    let durStr    = monthly > 0 ? "∞" : "–";
    if (months) {
      const finish = new Date();
      finish.setMonth(finish.getMonth() + months);
      finishStr = finish.toLocaleDateString("de-DE", { month: "short", year: "numeric" });
      const y = Math.floor(months / 12), m = months % 12;
      durStr = (y > 0 ? y + " J " : "") + (m > 0 ? m + " Mo" : "");
      if (!durStr.trim()) durStr = "< 1 Mo";
    }
    const el      = document.createElement("div");
    el.className  = "sp-goal";
    el.innerHTML  = `
      <div class="sp-goal-top">
        <div class="sp-goal-ico">${g.icon || "💰"}</div>
        <div class="sp-goal-info">
          <div class="sp-goal-name">${g.name}</div>
          <div class="sp-goal-meta">
            Ziel: ${target.toLocaleString("de-DE")} €
            ${months ? ` · ${durStr.trim()} · fertig ${finishStr}` : ""}
          </div>
        </div>
        <div class="sp-goal-monthly">${monthly} €/Mo</div>
      </div>
      <div class="sp-slider-row">
        <span class="sp-slider-side">10€</span>
        <input type="range" min="10" max="500" step="10" value="${monthly}" style="flex:1"
          oninput="updateGoalMonthly('${g.id}', this.value, this.nextElementSibling)" />
        <span class="sp-slider-side right" id="sp-side-${g.id}">${monthly}€</span>
        <button onclick="openEditGoalModal('${g.id}')" style="color:var(--muted);font-size:14px;padding:4px 6px;margin-left:4px">✎</button>
        <button onclick="removeGoal('${g.id}')" style="color:var(--muted2);font-size:16px;padding:4px 4px">✕</button>
      </div>
      <div class="sp-progress-bar"><div class="sp-progress-fill" style="width:${pct}%"></div></div>
      <div class="sp-progress-lbl"><span>${saved.toLocaleString("de-DE")} € gespart</span><span>${pct}%</span></div>
    `;
    container.appendChild(el);
  });
}

function updateGoalMonthly(id, val, sideEl) {
  updateGoal(state, id, { monthly: parseInt(val) });
  if (sideEl) sideEl.textContent = val + "€";
  saveState(state);
  const total = state.goals.reduce((s, g) => s + (g.monthly || 0), 0);
  document.getElementById("sp-total-val").textContent = total.toLocaleString("de-DE") + " € / Mo";
}

function removeGoal(id) {
  if (!confirm("Sparziel wirklich löschen?")) return;
  deleteGoal(state, id);
  saveState(state);
  renderSparplan();
}

// ── Goal Modal Mode ───────────────────────────────────────────────
let goalMode = "rate"; // "rate" | "duration"

function setGoalMode(mode) {
  goalMode = mode;
  document.getElementById("goal-mode-rate").style.display     = mode === "rate"     ? "" : "none";
  document.getElementById("goal-mode-duration").style.display = mode === "duration" ? "" : "none";
  document.getElementById("mode-btn-rate").className     = "type-chip" + (mode === "rate"     ? " active-saving" : "");
  document.getElementById("mode-btn-duration").className = "type-chip" + (mode === "duration" ? " active-saving" : "");
  recalcGoalPreview();
}

function setDurationQuick(months) {
  document.getElementById("goal-duration-months").value = months;
  recalcGoalPreview();
}

function onGoalSliderChange(val) {
  document.getElementById("goal-monthly-lbl").textContent = val + " €";
  recalcGoalPreview();
}

function recalcGoalPreview() {
  const target  = parseFloat(document.getElementById("goal-target").value)  || 0;
  const saved   = parseFloat(document.getElementById("goal-saved").value)   || 0;
  const left    = Math.max(0, target - saved);
  const preview = document.getElementById("goal-preview");

  if (target <= 0) { preview.style.display = "none"; return; }

  let rate, durationMonths;

  if (goalMode === "rate") {
    rate          = parseInt(document.getElementById("goal-monthly-slider").value) || 50;
    durationMonths = rate > 0 ? Math.ceil(left / rate) : null;
  } else {
    durationMonths = parseInt(document.getElementById("goal-duration-months").value) || null;
    rate          = durationMonths && durationMonths > 0 ? Math.ceil(left / durationMonths) : null;
    // update slider to reflect computed rate
    if (rate) {
      const clamped = Math.min(500, Math.max(10, rate));
      document.getElementById("goal-monthly-slider").value = clamped;
      document.getElementById("goal-monthly-lbl").textContent = rate + " €";
    }
  }

  if (!rate || !durationMonths) { preview.style.display = "none"; return; }

  // Compute finish date
  const finish = new Date();
  finish.setMonth(finish.getMonth() + durationMonths);
  const finishStr = finish.toLocaleDateString("de-DE", { month: "short", year: "numeric" });

  const years  = Math.floor(durationMonths / 12);
  const months = durationMonths % 12;
  let durStr   = "";
  if (years > 0)  durStr += years  + " J ";
  if (months > 0) durStr += months + " Mo";
  if (!durStr)    durStr = "< 1 Mo";

  document.getElementById("preview-rate").textContent     = rate.toLocaleString("de-DE") + " €";
  document.getElementById("preview-duration").textContent = durStr.trim();
  document.getElementById("preview-date").textContent     = finishStr;
  preview.style.display = "";
}

function openAddGoalModal() {
  editGoalId = null;
  document.getElementById("goal-modal-title").textContent = "Sparziel hinzufügen";
  document.getElementById("goal-icon").value    = "";
  document.getElementById("goal-name").value    = "";
  document.getElementById("goal-target").value  = "";
  document.getElementById("goal-saved").value   = "0";
  document.getElementById("goal-monthly-slider").value = 50;
  document.getElementById("goal-monthly-lbl").textContent = "50 €";
  document.getElementById("goal-duration-months").value = "";
  document.getElementById("goal-preview").style.display = "none";
  setGoalMode("rate");
  hideEl("goal-delete-btn");
  openModal("modal-goal");
}

function openEditGoalModal(id) {
  const g = state.goals.find(g => g.id === id);
  if (!g) return;
  editGoalId = id;
  document.getElementById("goal-modal-title").textContent = "Sparziel bearbeiten";
  document.getElementById("goal-icon").value    = g.icon || "";
  document.getElementById("goal-name").value    = g.name;
  document.getElementById("goal-target").value  = g.target || "";
  document.getElementById("goal-saved").value   = g.saved || 0;
  document.getElementById("goal-monthly-slider").value = g.monthly || 50;
  document.getElementById("goal-monthly-lbl").textContent = (g.monthly || 50) + " €";
  document.getElementById("goal-duration-months").value = g.durationMonths || "";
  setGoalMode(g.durationMonths ? "duration" : "rate");
  recalcGoalPreview();
  showEl("goal-delete-btn");
  openModal("modal-goal");
}

function saveGoal() {
  const name    = document.getElementById("goal-name").value.trim();
  const icon    = document.getElementById("goal-icon").value.trim() || "💰";
  const target  = parseFloat(document.getElementById("goal-target").value) || 0;
  const saved   = parseFloat(document.getElementById("goal-saved").value)  || 0;
  const monthly = parseInt(document.getElementById("goal-monthly-slider").value) || 50;
  const durationMonths = goalMode === "duration"
    ? parseInt(document.getElementById("goal-duration-months").value) || null
    : null;
  if (!name) return;

  if (editGoalId) {
    updateGoal(state, editGoalId, { name, icon, target, saved, monthly, durationMonths });
  } else {
    addGoal(state, { name, icon, target, saved, monthly, durationMonths });
  }

  saveState(state);
  closeModal("modal-goal");
  renderSparplan();
}

function deleteCurrentGoal() {
  if (!editGoalId) return;
  if (!confirm("Sparziel wirklich löschen?")) return;
  deleteGoal(state, editGoalId);
  saveState(state);
  closeModal("modal-goal");
  renderSparplan();
}

// ── KI Export ─────────────────────────────────────────────────────
function exportForKi() {
  const prompt = buildKiExport(state, state.currentMonth);
  copyToClipboard(prompt, null);
  alert("✅ KI-Analyse Prompt wurde in die Zwischenablage kopiert!\n\nJetzt in ChatGPT, Claude oder Gemini einfügen.");
}

// ── Settings ──────────────────────────────────────────────────────
function renderSettings() {
  const mk = state.currentMonth;
  ensureMonth(state, mk);
  const income = state.months[mk].income || 0;
  document.getElementById("settings-income-val").textContent =
    income > 0 ? Math.round(income).toLocaleString("de-DE") + " €" : "– €";
  document.getElementById("settings-month-val").textContent = monthLabel(mk);
}

function clearAllData() {
  if (!confirm("Wirklich alle Daten löschen? Das kann nicht rückgängig gemacht werden.")) return;
  state = defaultState();
  saveState(state);
  renderOverview();
  renderSettings();
  alert("Alle Daten wurden gelöscht.");
}

// ── Modal Helpers ─────────────────────────────────────────────────
function openModal(id)  { document.getElementById(id).classList.add("open"); }
function closeModal(id) { document.getElementById(id).classList.remove("open"); }

document.querySelectorAll(".modal-overlay").forEach(o => {
  o.addEventListener("pointerdown", e => {
    console.log('Modal overlay tapped');
    if (e.target === o) o.classList.remove("open");
  });
});

// ── DOM Helpers ───────────────────────────────────────────────────
function showEl(id) { const el = document.getElementById(id); if (el) el.style.display = ""; }
function hideEl(id) { const el = document.getElementById(id); if (el) el.style.display = "none"; }

function copyToClipboard(text, feedbackId) {
  const run = () => {
    if (feedbackId) {
      const el = document.getElementById(feedbackId);
      if (el) { el.classList.add("show"); setTimeout(() => el.classList.remove("show"), 2000); }
    }
  };
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(run).catch(() => fallbackCopy(text, run));
  } else {
    fallbackCopy(text, run);
  }
}

function fallbackCopy(text, cb) {
  const ta = document.createElement("textarea");
  ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
  document.body.appendChild(ta); ta.select(); document.execCommand("copy");
  document.body.removeChild(ta); if (cb) cb();
}

// ── Init ──────────────────────────────────────────────────────────
(function init() {
  // Platform detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  document.body.classList.add(isMobile ? 'mobile' : 'desktop');

  // Filter chips
  document.querySelectorAll(".filter-chip").forEach(chip => {
    chip.addEventListener("pointerdown", () => setFilter(chip.dataset.filter));
  });

  // Sort select
  const sortSel = document.getElementById("sort-select");
  if (sortSel) sortSel.addEventListener("change", () => setSort(sortSel.value));

  // Service Worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }

  renderOverview();
  renderSettings();
})();
