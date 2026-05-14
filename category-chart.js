// Category chart aggregation and rendering for the overview screen.

const CATEGORY_TYPE_COLORS = {
  fixed: "var(--col-fixed)",
  fun: "var(--col-fun)",
  saving: "var(--col-saving)",
};

const CHART_ENTRY_TYPES = Object.keys(CATEGORY_TYPE_COLORS);

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
    .filter(isChartEntry)
    .forEach(entry => {
      const category = normalizeCategoryName(entry);
      const amount = Number(entry.amount) || 0;
      const current = totals.get(category) || createCategoryTotal();

      current.amount += amount;
      current.typeTotals[entry.type] += amount;
      totals.set(category, current);
    });

  const total = [...totals.values()].reduce((sum, item) => sum + item.amount, 0);

  if (total <= 0) {
    return { total: 0, items: [] };
  }

  const items = [...totals.entries()]
    .map(([category, item]) => ({
      category,
      amount: item.amount,
      percent: (item.amount / total) * 100,
      color: getCategoryColor(item.typeTotals),
    }));

  return {
    total,
    items: items.sort((a, b) => b.amount - a.amount),
  };
}

function isChartEntry(entry) {
  return entry && CHART_ENTRY_TYPES.includes(entry.type) && Number(entry.amount) > 0;
}

function createCategoryTotal() {
  return {
    amount: 0,
    typeTotals: { fixed: 0, fun: 0, saving: 0 },
  };
}

function getCategoryColor(typeTotals) {
  return CATEGORY_TYPE_COLORS[getDominantType(typeTotals)] || CATEGORY_TYPE_COLORS.fun;
}

function getDominantType(typeTotals) {
  const sortedTypes = Object.entries(typeTotals).sort((a, b) => b[1] - a[1]);
  return sortedTypes[0]?.[0] || "fun";
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
