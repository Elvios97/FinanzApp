const GITHUB_API_VERSION = "2022-11-28";
const DEFAULT_LABELS = [];

module.exports = async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Nur POST ist erlaubt." });
  }

  try {
    const payload = parseRequestBody(req.body);
    const feedback = normalizeFeedback(payload);
    const validationError = validateFeedback(feedback);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    if (feedback.website) {
      return res.status(200).json({ ok: true });
    }

    const config = getGithubConfig();
    const issue = await createGithubIssue(config, {
      title: feedback.title,
      body: buildIssueBody(feedback),
      labels: config.labels,
    });

    return res.status(201).json({
      ok: true,
      issueNumber: issue.number,
      issueUrl: issue.html_url,
    });
  } catch (error) {
    console.error("Bug report failed:", error);
    return res.status(error.statusCode || 500).json({
      error: error.publicMessage || "Der Bug-Report konnte nicht erstellt werden.",
    });
  }
};

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function parseRequestBody(body) {
  if (!body) return {};
  if (typeof body === "string") return JSON.parse(body);
  return body;
}

function normalizeFeedback(payload) {
  return {
    title: clean(payload.title),
    description: clean(payload.description),
    steps: clean(payload.steps),
    actual: clean(payload.actual),
    expected: clean(payload.expected),
    device: clean(payload.device),
    notes: clean(payload.notes),
    website: clean(payload.website),
  };
}

function clean(value) {
  return String(value || "").trim().slice(0, 4000);
}

function validateFeedback({ title, description }) {
  if (!title) return "Bitte gib einen Titel ein.";
  if (!description) return "Bitte gib eine Beschreibung ein.";
  if (title.length < 3) return "Der Titel ist zu kurz.";
  if (description.length < 10) return "Die Beschreibung ist zu kurz.";
  return "";
}

function getGithubConfig() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const labels = process.env.GITHUB_LABELS
    ? process.env.GITHUB_LABELS.split(",").map(label => label.trim()).filter(Boolean)
    : DEFAULT_LABELS;

  if (!token || !owner || !repo) {
    const error = new Error("GitHub configuration missing");
    error.statusCode = 500;
    error.publicMessage = "Bug-Report-Service ist noch nicht vollständig konfiguriert.";
    throw error;
  }

  return { token, owner, repo, labels };
}

async function createGithubIssue({ token, owner, repo }, issue) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
    method: "POST",
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "FinanzApp-Bug-Reporter",
      "X-GitHub-Api-Version": GITHUB_API_VERSION,
    },
    body: JSON.stringify(issue),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(result.message || "GitHub issue creation failed");
    error.statusCode = response.status;
    error.publicMessage = "GitHub konnte das Issue nicht erstellen. Bitte kopiere den Bug-Report und melde ihn manuell.";
    throw error;
  }

  return result;
}

function buildIssueBody({ description, steps, actual, expected, device, notes }) {
  const fallback = "Keine Angabe";

  return `## Beschreibung
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
