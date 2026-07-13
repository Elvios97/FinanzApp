// ═══════════════════════════════════════════════════════════════
// app.js — MeinGeld v3 · Application Logic
// ═══════════════════════════════════════════════════════════════

import {
  IMPORT_PROMPT,
  addEntry,
  addGoal,
  buildKiExport,
  defaultState,
  deleteEntry,
  deleteGoal,
  ensureMonth,
  getAvailableMonths,
  getMonthData,
  importEntries,
  loadState,
  monthLabel,
  saveState,
  updateEntry,
  updateGoal,
} from "./db.js";
import { renderCategoryPieChart } from "./category-chart.js";

const TYPE_CFG = {
  fixed:  { color: "var(--col-fixed)",  label: "Fixkosten",  bg: "var(--type-fixed-bg)", code: "F" },
  fun:    { color: "var(--col-fun)",    label: "Freizeit",   bg: "var(--type-fun-bg)", code: "A" },
  saving: { color: "var(--col-saving)", label: "Sparen",     bg: "var(--type-saving-bg)", code: "S" },
  income: { color: "var(--col-income)", label: "Einnahme",    bg: "var(--type-income-bg)", code: "E" },
};

const BUG_REPORT_ENDPOINT = "/api/report-bug";
const FEEDBACK_EMAIL = "happypsyduck97@gmail.com";
const RING_CIRCUMFERENCE = 389.6;

const ENTRY_FILTERS = {
  all:      () => true,
  fixed:    entry => entry.type === "fixed",
  fun:      entry => entry.type === "fun",
  saving:   entry => entry.type === "saving",
  income:   entry => entry.type === "income",
  manual:   entry => entry.source === "manual",
  imported: entry => entry.source === "imported",
};

const ENTRY_SORTERS = {
  "amount-desc": (a, b) => b.amount - a.amount,
  "amount-asc":  (a, b) => a.amount - b.amount,
  "name-asc":    (a, b) => a.name.localeCompare(b.name, "de"),
  "name-desc":   (a, b) => b.name.localeCompare(a.name, "de"),
  "date-desc":   (a, b) => (b.date || "").localeCompare(a.date || ""),
  "date-asc":    (a, b) => (a.date || "").localeCompare(b.date || ""),
  type:          (a, b) => a.type.localeCompare(b.type),
};

// ── State ─────────────────────────────────────────────────────────
let state = loadState();
let activeFilter = "all";
let activeSort   = "amount-desc";
let activeOverviewPanel = "list";
let editEntryId  = null;
let editGoalId   = null;

function formatWholeEuro(value) {
  return Math.round(Math.abs(value)).toLocaleString("de-DE") + " €";
}

function formatDecimalEuro(value) {
  return Number(value).toLocaleString("de-DE", { minimumFractionDigits: 2 }) + " €";
}

function formatSignedWholeEuro(value) {
  return (value >= 0 ? "+" : "-") + formatWholeEuro(value);
}

function getRemainingColor(remaining, income) {
  if (remaining < 0) return "var(--red)";
  if (remaining < income * .08) return "var(--yellow)";
  return "var(--green)";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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

function setOverviewSidePanel(panel) {
  activeOverviewPanel = panel === "mix" ? "mix" : "list";
  const showMix = activeOverviewPanel === "mix";

  document.getElementById("screen-overview")?.classList.toggle("show-mix", showMix);
  document.getElementById("screen-overview")?.classList.toggle("show-list", !showMix);

  document.querySelectorAll(".overview-panel-tab").forEach(tab => {
    const isActive = tab.id === (showMix ? "overview-tab-mix" : "overview-tab-list");
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", isActive ? "true" : "false");
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    tab.style.setProperty("background", isActive
      ? (isLight ? "linear-gradient(135deg, #2b9b8d, #3193a8)" : "linear-gradient(135deg, #6fc5b4, #7cccd8)")
      : (isLight ? "linear-gradient(135deg, #eef4fb, #eef4fb)" : "linear-gradient(135deg, #22304a, #22304a)"), "important");
    tab.style.setProperty("color", isActive
      ? (isLight ? "#ffffff" : "#06131a")
      : (isLight ? "#22324a" : "#d7e5f0"), "important");
    tab.style.setProperty("-webkit-text-fill-color", isActive
      ? (isLight ? "#ffffff" : "#06131a")
      : (isLight ? "#22324a" : "#d7e5f0"), "important");
    tab.style.setProperty("border-color", isActive ? (isLight ? "#2b9b8d" : "#79d7c2") : "transparent", "important");
  });
}

// ── Render Overview ───────────────────────────────────────────────
function renderOverview() {
  const mk   = state.currentMonth;
  const data = getMonthData(state, mk);

  renderIncomeSummary(mk, data.baseIncome);
  renderBudgetRing(data);
  renderOverviewStats(data);
  renderRemainingHighlight(data);
  renderCategoryPieChart(data.entries);
  renderEntryList();
  setOverviewSidePanel(activeOverviewPanel);
}

function renderIncomeSummary(monthKey, income) {
  document.getElementById("overview-income").textContent = income > 0 ? formatWholeEuro(income) : "– €";
  document.getElementById("overview-month").textContent = monthLabel(monthKey);
}

function renderBudgetRing({ income, fixed, fun, saving, remaining }) {
  const remainingColor = getRemainingColor(remaining, income);
  const arc = value => income > 0 ? (value / income) * RING_CIRCUMFERENCE : 0;
  const fixedArc = arc(fixed);
  const funArc = arc(fun);
  const savingArc = arc(saving);
  const remainingArc = arc(Math.max(0, remaining));

  setRingArc("arc-fixed", fixedArc, 0);
  setRingArc("arc-fun", funArc, fixedArc);
  setRingArc("arc-saving", savingArc, fixedArc + funArc);
  setRingArc("arc-remain", remainingArc, fixedArc + funArc + savingArc, remainingColor);

  const remainingValue = document.getElementById("ring-remain-val");
  remainingValue.textContent = income > 0 ? formatSignedWholeEuro(remaining) : "– €";
  remainingValue.style.color = income > 0 ? remainingColor : "var(--muted)";
}

function setRingArc(id, dashLength, offset, color) {
  const arc = document.getElementById(id);
  if (!arc) return;
  arc.style.strokeDasharray = `${dashLength} ${RING_CIRCUMFERENCE}`;
  arc.style.strokeDashoffset = `-${offset}`;
  if (color) arc.style.stroke = color;
}

function renderOverviewStats({ baseIncome, extraIncome, expenses, saving, income, remaining }) {
  document.getElementById("stat-base-income").textContent = formatWholeEuro(baseIncome);
  document.getElementById("stat-extra-income").textContent = formatWholeEuro(extraIncome);
  document.getElementById("stat-expenses").textContent = formatWholeEuro(expenses);
  document.getElementById("stat-saving").textContent = formatWholeEuro(saving);
  document.getElementById("stat-available").textContent = income > 0 ? formatSignedWholeEuro(remaining) : "– €";
  document.getElementById("stat-available").style.color = income > 0 ? getRemainingColor(remaining, income) : "var(--muted)";
}

function renderRemainingHighlight({ income, remaining }) {
  const remainingColor = income === 0 ? "var(--muted)" : getRemainingColor(remaining, income);
  const card = document.getElementById("hl-card");
  const value = document.getElementById("hl-val");
  const subline = document.getElementById("hl-sub");

  card.style.setProperty("--hl-accent", remainingColor);
  card.classList.remove("hl-empty", "hl-negative", "hl-positive");

  if (income === 0) {
    card.classList.add("hl-empty");
    value.style.color = "var(--muted)";
    value.textContent = "– €";
    subline.style.color = "var(--muted)";
    subline.textContent = "Einkommen eintragen oder Kontoauszug importieren →";
    return;
  }

  if (remaining < 0) {
    card.classList.add("hl-negative");
    value.style.color = "var(--red)";
    value.textContent = formatSignedWholeEuro(remaining);
    subline.style.color = "var(--red)";
    subline.textContent = "Ausgaben übersteigen Einnahmen.";
    return;
  }

  card.classList.add("hl-positive");
  value.style.color = "var(--green)";
  value.textContent = formatSignedWholeEuro(remaining);
  subline.style.color = "var(--hl-accent)";
  subline.textContent = `${Math.round((remaining / income) * 100)}% frei · ${formatWholeEuro(remaining / 4)} / Woche`;
}

// ── Entry List with Filter + Sort ─────────────────────────────────
function renderEntryList() {
  const data = getMonthData(state, state.currentMonth);
  const entries = getVisibleEntries(data.entries);
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
    list.appendChild(createEntryRow(entry, data.income));
  });
}

function getVisibleEntries(entries) {
  const filter = ENTRY_FILTERS[activeFilter] || ENTRY_FILTERS.all;
  const sorter = ENTRY_SORTERS[activeSort] || ENTRY_SORTERS["amount-desc"];
  return [...entries].filter(filter).sort(sorter);
}

function createEntryRow(entry, income) {
  const cfg = TYPE_CFG[entry.type] || TYPE_CFG.fun;
  const percentOfIncome = income > 0 ? Math.min(100, (entry.amount / income) * 100) : 0;
  const dateStr = entry.date
    ? new Date(entry.date).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })
    : "";
  const signedAmount = (entry.type === "income" ? "+" : "-") + formatDecimalEuro(entry.amount);
  const safeName = escapeHtml(entry.name);
  const safeNote = escapeHtml(entry.note);

  const row = document.createElement("div");
  row.className = `entry-row entry-${entry.type}`;
  row.dataset.testid = "entry-row";
  row.innerHTML = `
    <div class="entry-dot" style="background:${cfg.color}"></div>
    <div class="entry-ico" style="color:${cfg.color};border-color:${cfg.color}">${cfg.code}</div>
    <div class="entry-info">
      <div class="entry-name">${safeName}</div>
      <div class="entry-meta">
        <span class="entry-type-badge" style="background:${cfg.bg};color:${cfg.color}">${cfg.label}</span>
        ${dateStr ? `<span class="entry-date">${dateStr}</span>` : ""}
        <span class="entry-source-badge">${entry.source === "manual" ? "manuell" : "import"}</span>
      </div>
      ${entry.note ? `<div class="entry-note">${safeNote}</div>` : ""}
      <div class="entry-bar"><div class="entry-bar-fill" style="width:${percentOfIncome}%;background:${cfg.color}"></div></div>
    </div>
    <div class="entry-amt" style="color:${cfg.color}">${signedAmount}</div>
  `;
  row.addEventListener("click", () => openEditEntryModal(entry));
  return row;
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
  clearFormError("entry-form-error");
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
  clearFormError("entry-form-error");
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
  document.querySelectorAll(".type-selector .type-chip").forEach(c => {
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

  if (!name) {
    showFormError("entry-form-error", "Bitte gib einen Namen ein.");
    return;
  }
  if (isNaN(amount) || amount <= 0) {
    showFormError("entry-form-error", "Bitte gib einen Betrag groesser als 0 ein.");
    return;
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
  clearFormError("income-form-error");
  document.getElementById("income-modal-input").value = state.months[mk].income || "";
  openModal("modal-income");
}

function saveIncome() {
  const v = parseFloat(document.getElementById("income-modal-input").value);
  if (isNaN(v) || v <= 0) {
    showFormError("income-form-error", "Bitte gib ein Einkommen groesser als 0 ein.");
    return;
  }

  ensureMonth(state, state.currentMonth);
  state.months[state.currentMonth].income = v;
  saveState(state);
  renderOverview();
  renderSettings();
  closeModal("modal-income");
}

// ── History Screen ────────────────────────────────────────────────
function renderHistory() {
  const months = getAvailableMonths(state);
  const current = state.currentMonth;
  const container = document.getElementById("month-list");
  container.innerHTML = "";

  if (!months.length) {
    container.innerHTML = `<div class="entry-empty">Noch keine Monatsdaten vorhanden.</div>`;
    return;
  }

  months.forEach(mk => {
    container.appendChild(createMonthCard(mk, mk === current));
  });
}

function createMonthCard(monthKey, isCurrent) {
  const data = getMonthData(state, monthKey);
  const remainingColor = getRemainingColor(data.remaining, data.income);
  const card = document.createElement("div");

  card.className = "month-card" + (isCurrent ? " current" : "");
  card.innerHTML = `
    <div class="month-card-left">
      <div class="month-card-name">${monthLabel(monthKey)}${isCurrent ? " <span style='color:var(--green);font-size:11px'>●</span>" : ""}</div>
      <div class="month-card-entries">${data.entries.length} Einträge</div>
    </div>
    <div class="month-card-right">
      <div class="month-card-remain" style="color:${remainingColor}">${formatSignedWholeEuro(data.remaining)}</div>
      <div class="month-card-income">${formatWholeEuro(data.income)} Einnahmen</div>
    </div>
  `;
  card.addEventListener("click", () => {
    state.currentMonth = monthKey;
    saveState(state);
    switchScreen("overview");
  });
  return card;
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
  renderSparplanSummary();
  const container = document.getElementById("sp-goals");
  container.innerHTML = "";

  goals.forEach(goal => container.appendChild(createGoalCard(goal)));
}

function renderSparplanSummary() {
  const goals = state.goals;
  const totalMonthly = goals.reduce((sum, goal) => sum + (goal.monthly || 0), 0);
  document.getElementById("sp-total-val").textContent = totalMonthly.toLocaleString("de-DE") + " € / Mo";
  document.getElementById("sp-total-sub").textContent = totalMonthly > 0
    ? `${goals.length} aktive${goals.length === 1 ? "s" : ""} Ziel${goals.length === 1 ? "" : "e"} · ${(totalMonthly * 12).toLocaleString("de-DE")} € / Jahr`
    : "Füge dein erstes Sparziel hinzu";
}

function createGoalCard(goal) {
  const projection = getGoalProjection(goal);
  const card = document.createElement("div");
  const safeIcon = escapeHtml(goal.icon || "SP");
  const safeName = escapeHtml(goal.name);

  card.className = "sp-goal";
  card.innerHTML = `
    <div class="sp-goal-top">
      <div class="sp-goal-ico">${safeIcon}</div>
      <div class="sp-goal-info">
        <div class="sp-goal-name">${safeName}</div>
        <div class="sp-goal-meta">
          Ziel: ${projection.target.toLocaleString("de-DE")} €
          ${projection.months ? ` · ${projection.durationLabel} · fertig ${projection.finishLabel}` : ""}
        </div>
      </div>
      <div class="sp-goal-monthly">${projection.monthly} €/Mo</div>
    </div>
    <div class="sp-slider-row">
      <span class="sp-slider-side">10€</span>
      <input type="range" min="10" max="500" step="10" value="${projection.monthly}" style="flex:1"
        oninput="updateGoalMonthly('${goal.id}', this.value, this.nextElementSibling)" />
      <span class="sp-slider-side right" id="sp-side-${goal.id}">${projection.monthly}€</span>
      <button onclick="openEditGoalModal('${goal.id}')" style="color:var(--muted);font-size:12px;padding:4px 6px;margin-left:4px">Bearbeiten</button>
      <button onclick="removeGoal('${goal.id}')" style="color:var(--muted2);font-size:12px;padding:4px 4px">Entfernen</button>
    </div>
    <div class="sp-progress-bar"><div class="sp-progress-fill" style="width:${projection.percent}%"></div></div>
    <div class="sp-progress-lbl"><span>${projection.saved.toLocaleString("de-DE")} € gespart</span><span>${projection.percent}%</span></div>
  `;
  return card;
}

function getGoalProjection(goal) {
  const target = goal.target || 1;
  const saved = goal.saved || 0;
  const monthly = goal.monthly || 0;
  const left = Math.max(0, target - saved);
  const months = monthly > 0 ? Math.ceil(left / monthly) : null;

  if (!months) {
    return { target, saved, monthly, months, percent: getGoalProgressPercent(saved, target), durationLabel: "–", finishLabel: "–" };
  }

  const finish = new Date();
  finish.setMonth(finish.getMonth() + months);

  return {
    target,
    saved,
    monthly,
    months,
    percent: getGoalProgressPercent(saved, target),
    durationLabel: formatDurationMonths(months),
    finishLabel: finish.toLocaleDateString("de-DE", { month: "short", year: "numeric" }),
  };
}

function getGoalProgressPercent(saved, target) {
  return Math.min(100, Math.round((saved / target) * 100));
}

function formatDurationMonths(totalMonths) {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const label = (years > 0 ? years + " J " : "") + (months > 0 ? months + " Mo" : "");
  return label.trim() || "< 1 Mo";
}

function updateGoalMonthly(id, val, sideEl) {
  updateGoal(state, id, { monthly: parseInt(val) });
  if (sideEl) sideEl.textContent = val + "€";
  saveState(state);
  renderSparplanSummary();
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

  const { rate, durationMonths } = getGoalPreviewValues(left);

  if (!rate || !durationMonths) { preview.style.display = "none"; return; }

  const finish = new Date();
  finish.setMonth(finish.getMonth() + durationMonths);

  document.getElementById("preview-rate").textContent     = rate.toLocaleString("de-DE") + " €";
  document.getElementById("preview-duration").textContent = formatDurationMonths(durationMonths);
  document.getElementById("preview-date").textContent     = finish.toLocaleDateString("de-DE", { month: "short", year: "numeric" });
  preview.style.display = "";
}

function getGoalPreviewValues(left) {
  if (goalMode === "rate") {
    const rate = parseInt(document.getElementById("goal-monthly-slider").value) || 50;
    return {
      rate,
      durationMonths: rate > 0 ? Math.ceil(left / rate) : null,
    };
  }

  const durationMonths = parseInt(document.getElementById("goal-duration-months").value) || null;
  const rate = durationMonths && durationMonths > 0 ? Math.ceil(left / durationMonths) : null;

  if (rate) {
    const clampedRate = Math.min(500, Math.max(10, rate));
    document.getElementById("goal-monthly-slider").value = clampedRate;
    document.getElementById("goal-monthly-lbl").textContent = rate + " €";
  }

  return { rate, durationMonths };
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
  const icon    = document.getElementById("goal-icon").value.trim() || "SP";
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
  alert("KI-Analyse Prompt wurde in die Zwischenablage kopiert.\n\nJetzt in ChatGPT, Claude oder Gemini einfügen.");
}

// ── Settings ──────────────────────────────────────────────────────
function renderSettings() {
  const mk = state.currentMonth;
  ensureMonth(state, mk);
  const income = state.months[mk].income || 0;
  document.getElementById("settings-income-val").textContent =
    income > 0 ? Math.round(income).toLocaleString("de-DE") + " €" : "– €";
  document.getElementById("settings-month-val").textContent = monthLabel(mk);
  applyTheme(state.theme);
}

function clearAllData() {
  if (!confirm("Wirklich alle Daten löschen? Das kann nicht rückgängig gemacht werden.")) return;
  state = defaultState();
  saveState(state);
  renderOverview();
  renderSettings();
  alert("Alle Daten wurden gelöscht.");
}

function openFeedbackReport() {
  clearFormError("feedback-form-error");
  resetFeedbackSuccess();
  setFeedbackSubmitState(false);

  const copyFeedback = document.getElementById("feedback-copy-feedback");
  if (copyFeedback) copyFeedback.classList.remove("show");

  const deviceField = document.getElementById("feedback-device");
  if (deviceField && !deviceField.value) deviceField.value = navigator.userAgent;

  const emailButton = document.getElementById("feedback-email-btn");
  if (emailButton) emailButton.hidden = !FEEDBACK_EMAIL;

  openModal("modal-feedback");
}

async function submitFeedbackReport() {
  const feedback = getFeedbackFormValues();
  if (!validateFeedback(feedback)) return;

  setFeedbackSubmitState(true);
  resetFeedbackSuccess();

  try {
    const response = await fetch(BUG_REPORT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(feedback),
    });
    const result = await readJsonResponse(response);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Bug-Report API nicht erreichbar. Lokal bitte mit `npm run dev:vercel` starten, damit /api/report-bug verfügbar ist.");
      }
      throw new Error(result.error || "Der Bug-Report konnte nicht gesendet werden.");
    }

    showFeedbackSuccess(result.issueUrl);
  } catch (error) {
    showFormError("feedback-form-error", error.message || "Der Bug-Report konnte nicht gesendet werden. Bitte kopiere den Report und melde ihn manuell.");
  } finally {
    setFeedbackSubmitState(false);
  }
}

function copyFeedbackReport() {
  const feedback = getFeedbackFormValues();
  if (!validateFeedback(feedback)) return;

  copyToClipboard(buildFeedbackReport(feedback), "feedback-copy-feedback");
}

function sendFeedbackEmail() {
  if (!FEEDBACK_EMAIL) return;

  const feedback = getFeedbackFormValues();
  if (!validateFeedback(feedback)) return;

  window.location.href = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(feedback.title)}&body=${encodeURIComponent(buildFeedbackReport(feedback))}`;
}

function getFeedbackFormValues() {
  const valueOf = id => document.getElementById(id)?.value.trim() || "";

  return {
    title: valueOf("feedback-title") || "Feedback zur FinanzApp",
    description: valueOf("feedback-description"),
    steps: valueOf("feedback-steps"),
    actual: valueOf("feedback-actual"),
    expected: valueOf("feedback-expected"),
    device: valueOf("feedback-device"),
    notes: valueOf("feedback-notes"),
    website: valueOf("feedback-website"),
  };
}

function validateFeedback({ title, description }) {
  if (!title || !description) {
    showFormError("feedback-form-error", "Bitte gib mindestens einen Titel und eine Beschreibung ein.");
    return false;
  }

  clearFormError("feedback-form-error");
  return true;
}

async function readJsonResponse(response) {
  try {
    return await response.json();
  } catch (_) {
    return {};
  }
}

function setFeedbackSubmitState(isSubmitting) {
  const button = document.getElementById("feedback-submit-btn");
  if (!button) return;

  button.disabled = isSubmitting;
  button.textContent = isSubmitting ? "Wird gesendet..." : "Bug melden";
}

function showFeedbackSuccess(issueUrl) {
  const success = document.getElementById("feedback-success");
  if (!success) return;

  success.style.display = "";
  success.hidden = false;
  success.innerHTML = issueUrl
    ? `Danke, dein Bug wurde gemeldet. <a href="${escapeHtml(issueUrl)}" target="_blank" rel="noopener">Issue ansehen</a>`
    : "Danke, dein Bug wurde gemeldet.";
}

function resetFeedbackSuccess() {
  const success = document.getElementById("feedback-success");
  if (!success) return;

  success.hidden = true;
  success.style.display = "";
  success.textContent = "";
}

function buildFeedbackReport({ title, description, steps, actual, expected, device, notes }) {
  const fallback = "Keine Angabe";

  return `# ${title}

## Beschreibung
${description || fallback}

## Schritte zum Reproduzieren
${steps || fallback}

## Tatsächliches Verhalten
${actual || fallback}

## Erwartetes Verhalten
${expected || fallback}

## Gerät / Browser
${device || fallback}

## Weitere Hinweise
${notes || fallback}`;
}

// ── Theme Toggle ──────────────────────────────────────────────────
function applyTheme(theme) {
  const nextTheme = theme === "light" ? "light" : "dark";
  const switchEl = document.getElementById("theme-switch");
  const labelEl = document.getElementById("theme-label");

  state.theme = nextTheme;
  document.documentElement.setAttribute("data-theme", nextTheme);

  if (switchEl) switchEl.checked = nextTheme === "light";
  if (labelEl) labelEl.textContent = nextTheme === "light" ? "Helles Design" : "Dunkles Design";
  setOverviewSidePanel(activeOverviewPanel);
}

function toggleTheme() {
  const switchEl = document.getElementById("theme-switch");
  const isLight = switchEl.checked;
  applyTheme(isLight ? "light" : "dark");
  saveState(state);
}

// ── Modal Helpers ─────────────────────────────────────────────────
function openModal(id)  {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.hidden = false;
  modal.classList.add("open");
}
function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove("open");
  modal.hidden = true;
}

document.querySelectorAll(".modal-overlay").forEach(o => {
  o.addEventListener("pointerdown", e => {
    if (e.target === o) closeModal(o.id);
  });
});

// ── DOM Helpers ───────────────────────────────────────────────────
function showEl(id) { const el = document.getElementById(id); if (el) el.style.display = ""; }
function hideEl(id) { const el = document.getElementById(id); if (el) el.style.display = "none"; }
function showFormError(id, message) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
}
function clearFormError(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = "";
  el.hidden = true;
}

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

Object.assign(window, {
  switchScreen,
  setOverviewSidePanel,
  copyImportPrompt,
  runImport,
  openAddEntryModal,
  openEditEntryModal,
  setEntryType,
  saveEntry,
  deleteCurrentEntry,
  openIncomeModal,
  saveIncome,
  openNewMonthModal,
  saveNewMonth,
  openAddGoalModal,
  openEditGoalModal,
  setGoalMode,
  setDurationQuick,
  onGoalSliderChange,
  recalcGoalPreview,
  updateGoalMonthly,
  removeGoal,
  saveGoal,
  deleteCurrentGoal,
  exportForKi,
  clearAllData,
  openFeedbackReport,
  submitFeedbackReport,
  copyFeedbackReport,
  sendFeedbackEmail,
  closeModal,
});

// ── Init ──────────────────────────────────────────────────────────
(function init() {
  // Theme initialization
  applyTheme(state.theme);
  const switchEl = document.getElementById("theme-switch");
  const themeRow = document.getElementById("theme-row");
  if (switchEl) {
    switchEl.addEventListener("change", toggleTheme);
  }
  if (themeRow && switchEl) {
    themeRow.addEventListener("click", (event) => {
      if (event.target.closest(".theme-toggle")) return;
      switchEl.checked = !switchEl.checked;
      toggleTheme();
    });
  }

  // Only overview filter chips carry data-filter; Sparplan quick buttons reuse the visual class.
  document.querySelectorAll(".filter-chip[data-filter]").forEach(chip => {
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
