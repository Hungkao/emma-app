// Local server for Talk with Emma: `npm start` → http://localhost:3000
// Serves index.html, /api/emma (Claude) and /api/health. No extra packages needed.
// The API key is read from .env.local or .env in this folder (ANTHROPIC_API_KEY=...).

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));

// Load .env.local then .env (values already in the environment win).
for (const name of [".env.local", ".env"]) {
  const file = path.join(DIR, name);
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m || line.trim().startsWith("#")) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!(m[1] in process.env)) process.env[m[1]] = v;
  }
}

const { default: emma } = await import("./api/emma.js");
const { default: health } = await import("./api/health.js");

// Minimal Express-style response helpers so the same handlers run on Vercel and here.
function wrap(res) {
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (o) => { res.setHeader("content-type", "application/json; charset=utf-8"); res.end(JSON.stringify(o)); return res; };
  return res;
}

const server = http.createServer(async (req, res) => {
  wrap(res);
  const url = new URL(req.url, "http://localhost");
  try {
    if (url.pathname === "/api/emma" || url.pathname === "/api/health") {
      let body = "";
      for await (const chunk of req) { body += chunk; if (body.length > 200_000) break; }
      req.body = body;
      return url.pathname === "/api/emma" ? emma(req, res) : health(req, res);
    }
    if (url.pathname === "/" || url.pathname === "/index.html") {
      res.setHeader("content-type", "text/html; charset=utf-8");
      res.setHeader("cache-control", "no-store");
      return res.end(fs.readFileSync(path.join(DIR, "index.html")));
    }
    res.status(404).json({ error: "not found" });
  } catch (e) {
    console.error(e);
    if (!res.headersSent) res.status(500).json({ error: "server error" });
  }
});

const PORT = Number(process.env.PORT) || 3000;
server.listen(PORT, () => {
  const key = process.env.ANTHROPIC_API_KEY || "";
  console.log(`\n  Talk with Emma → http://localhost:${PORT}\n`);
  if (!key) console.log("  AI: TẮT – chưa có ANTHROPIC_API_KEY trong .env.local (Emma vẫn chạy chế độ cơ bản)\n");
  else if (!key.startsWith("sk-ant-api")) console.log("  AI: Cảnh báo – key không giống Claude API key (thường bắt đầu bằng sk-ant-api03-)\n");
  else console.log("  AI: BẬT\n");
});
