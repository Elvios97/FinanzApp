import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(".");
const port = Number(process.env.PORT || 4173);
let idleTimer;

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json; charset=utf-8",
};

function resolveRequestPath(url) {
  const pathname = new URL(url || "/", `http://127.0.0.1:${port}`).pathname;
  const requested = pathname === "/" ? "/index.html" : pathname;
  const filePath = normalize(join(root, decodeURIComponent(requested)));

  if (!filePath.startsWith(root)) {
    return null;
  }

  return filePath;
}

const server = createServer((request, response) => {
  resetIdleTimer();
  const filePath = resolveRequestPath(request.url);

  if (!filePath || !existsSync(filePath) || !statSync(filePath).isFile()) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "Cache-Control": "no-store",
    "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream",
  });
  createReadStream(filePath).pipe(response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Static test server running at http://127.0.0.1:${port}`);
  resetIdleTimer();
});

function shutdown() {
  clearTimeout(idleTimer);
  server.close(() => {
    process.exit(0);
  });
}

function resetIdleTimer() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(shutdown, 5000);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
