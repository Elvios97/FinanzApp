# API-Dokumentation

FinanzApp ist primär eine browserbasierte Web-App ohne verpflichtendes Backend. Die Finanzdaten werden lokal im Browser gespeichert. Eine API gibt es aktuell nur optional für Bug-Reports und Feedback.

## Basis

Im normalen Vite-Dev-Server ist keine Serverless Function verfügbar:

```text
npm run dev
```

Für die lokale API-Entwicklung mit Vercel:

```text
npm run dev:vercel
```

## Statusübersicht

| Endpoint | Status | Zweck |
| --- | --- | --- |
| `POST /api/report-bug` | vorhanden | Erstellt optional ein GitHub Issue aus dem Feedback-Formular |
| `OPTIONS /api/report-bug` | vorhanden | CORS-Preflight für den Bug-Report-Endpunkt |

## POST `/api/report-bug`

Status: vorhanden

Der Endpoint wird vom Feedback-Modal in den Einstellungen genutzt. Wenn die GitHub-Konfiguration vorhanden ist, erstellt die Vercel Serverless Function serverseitig ein GitHub Issue.

Request:

```json
{
  "title": "Kurzer Titel",
  "description": "Beschreibung des Problems",
  "steps": "Schritte zum Reproduzieren",
  "actual": "Tatsächliches Verhalten",
  "expected": "Erwartetes Verhalten",
  "device": "Gerät und Browser",
  "notes": "Weitere Hinweise",
  "website": ""
}
```

Pflichtfelder:

- `title`
- `description`

Optionale Felder:

- `steps`
- `actual`
- `expected`
- `device`
- `notes`

Das Feld `website` ist ein Honeypot. Wenn es ausgefüllt ist, antwortet der Endpoint erfolgreich, erstellt aber kein Issue.

Erfolgreiche Response mit GitHub Issue:

```json
{
  "ok": true,
  "issueNumber": 1,
  "issueUrl": "https://github.com/OWNER/REPO/issues/1"
}
```

Erfolgreiche Response bei Honeypot:

```json
{
  "ok": true
}
```

Fehlerfälle:

- `400`: Titel oder Beschreibung fehlt.
- `400`: Titel oder Beschreibung ist zu kurz.
- `405`: Methode ist nicht `POST`.
- `500`: GitHub-Konfiguration fehlt.
- GitHub-API-Fehler werden als verständliche Fehlermeldung an das Frontend zurückgegeben.

## Environment Variables

Die GitHub-Daten dürfen nicht im Frontend stehen. Sie werden nur serverseitig gelesen.

```text
GITHUB_TOKEN=github_pat_xxx
GITHUB_OWNER=Elvios97
GITHUB_REPO=FinanzApp
GITHUB_LABELS=bug,feedback
```

Hinweise:

- `GITHUB_TOKEN` braucht Schreibrechte für Issues.
- `GITHUB_LABELS` ist optional.
- Labels sollten im Repository existieren, sonst kann die GitHub-API den Request ablehnen.

## Frontend-Fallback

Wenn `/api/report-bug` lokal nicht erreichbar ist oder die GitHub-Konfiguration fehlt, bleibt die Kopierfunktion im Feedback-Modal nutzbar. Nutzer können den Bug-Report dann manuell weitergeben.
