// Category chart aggregation and rendering for the overview screen.

const CATEGORY_CHART_COLORS = [
  "#69f0ae",
  "#80cbc4",
  "#ffd180",
  "#ce93d8",
  "#ff8a80",
  "#90caf9",
  "#e8d5b7",
];

const CATEGORY_BUCKETS = [
  {
    label: "Wohnen",
    keywords: ["wohnen", "miete", "nebenkosten", "strom", "gas", "heizung", "internet", "rundfunk"],
  },
  {
    label: "Transport",
    keywords: ["transport", "bahn", "db", "oepnv", "opnv", "ticket", "auto", "tanken", "parken", "uber", "bolt"],
  },
  {
    label: "Kosmetik",
    keywords: ["kosmetik", "dm", "rossmann", "drogerie", "friseur", "beauty", "pflege"],
  },
  {
    label: "Lebensmittel",
    keywords: ["lebensmittel", "supermarkt", "rewe", "aldi", "lidl", "edeka", "kaufland", "netto", "essen"],
  },
  {
    label: "Freizeit",
    keywords: ["freizeit", "hobby", "hobbys", "kino", "restaurant", "bar", "sport", "fitness", "reise", "urlaub"],
  },
  {
    label: "Software/KI",
    keywords: ["software", "ki", "ai", "chatgpt", "openai", "claude", "gemini", "notion", "github", "adobe", "app"],
  },
];

function normalizeCategoryName(entry) {
  const raw = `${entry.category || ""} ${entry.name || ""}`.toLowerCase();
  const normalized = raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ö/g, "oe")
    .replace(/ä/g, "ae")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");

  const bucket = CATEGORY_BUCKETS.find(group =>
    group.keywords.some(keyword => normalized.includes(keyword))
  );

  return bucket ? bucket.label : (entry.category || entry.name || "Sonstiges");
}

function buildCategoryChartData(entries) {
  const totals = new Map();

  entries
    .filter(entry => entry && ["fixed", "fun", "saving"].includes(entry.type) && Number(entry.amount) > 0)
    .forEach(entry => {
      const category = normalizeCategoryName(entry);
      const amount = Number(entry.amount) || 0;
      totals.set(category, (totals.get(category) || 0) + amount);
    });

  const total = [...totals.values()].reduce((sum, amount) => sum + amount, 0);

  if (total <= 0) {
    return { total: 0, items: [] };
  }

  const items = [...totals.entries()]
    .map(([category, amount], index) => ({
      category,
      amount,
      percent: (amount / total) * 100,
      color: CATEGORY_CHART_COLORS[index % CATEGORY_CHART_COLORS.length],
    }))
    .sort((a, b) => b.amount - a.amount)
    .map((item, index) => ({
      ...item,
      color: CATEGORY_CHART_COLORS[index % CATEGORY_CHART_COLORS.length],
    }));

  return { total, items };
}

function renderCategoryPieChart(entries) {
  const chart = document.getElementById("category-pie");
  const legend = document.getElementById("category-legend");
  const totalEl = document.getElementById("category-total");
  const emptyEl = document.getElementById("category-empty");
  const contentEl = document.getElementById("category-content");

  if (!chart || !legend || !totalEl || !emptyEl || !contentEl) return;

  const { total, items } = buildCategoryChartData(entries);
  const formatMoney = amount => amount.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " EUR";

  legend.innerHTML = "";

  if (!items.length) {
    chart.style.background = "var(--bg3)";
    totalEl.textContent = "0 EUR";
    emptyEl.style.display = "";
    contentEl.style.display = "none";
    return;
  }

  emptyEl.style.display = "none";
  contentEl.style.display = "";
  totalEl.textContent = formatMoney(total);

  let cursor = 0;
  const slices = items.map(item => {
    const start = cursor;
    cursor += item.percent;
    return `${item.color} ${start}% ${cursor}%`;
  });
  chart.style.background = `conic-gradient(${slices.join(", ")})`;

  items.forEach(item => {
    const row = document.createElement("div");
    row.className = "category-legend-row";

    const left = document.createElement("div");
    left.className = "category-legend-left";

    const dot = document.createElement("span");
    dot.className = "category-dot";
    dot.style.background = item.color;

    const name = document.createElement("span");
    name.className = "category-name";
    name.textContent = item.category;

    const values = document.createElement("div");
    values.className = "category-values";
    values.textContent = `${formatMoney(item.amount)} · ${item.percent.toFixed(1).replace(".", ",")}%`;

    left.append(dot, name);
    row.append(left, values);
    legend.appendChild(row);
  });
}
