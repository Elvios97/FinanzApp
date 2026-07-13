// Category chart aggregation and rendering for the overview screen.

const SPENDING_MIX_TYPES = {
  fixed: { label: "Fixkosten", color: "var(--col-fixed)" },
  fun: { label: "Freizeit", color: "var(--col-fun)" },
  saving: { label: "Sparen", color: "var(--col-saving)" },
};

const SPENDING_MIX_TYPE_ORDER = Object.keys(SPENDING_MIX_TYPES);

function buildCategoryChartData(entries) {
  const totalsByType = Object.fromEntries(SPENDING_MIX_TYPE_ORDER.map(type => [type, 0]));

  entries
    .filter(isChartEntry)
    .forEach(entry => {
      totalsByType[entry.type] += Number(entry.amount) || 0;
    });

  const total = Object.values(totalsByType).reduce((sum, amount) => sum + amount, 0);

  if (total <= 0) {
    return { total: 0, items: [] };
  }

  const items = SPENDING_MIX_TYPE_ORDER
    .map(type => ({
      category: SPENDING_MIX_TYPES[type].label,
      amount: totalsByType[type],
      percent: (totalsByType[type] / total) * 100,
      color: SPENDING_MIX_TYPES[type].color,
    }))
    .filter(item => item.amount > 0);

  return {
    total,
    items: items.sort((a, b) => b.amount - a.amount),
  };
}

function isChartEntry(entry) {
  return entry && SPENDING_MIX_TYPES[entry.type] && Number(entry.amount) > 0;
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

export { renderCategoryPieChart };
