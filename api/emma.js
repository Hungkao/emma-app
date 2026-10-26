// Vercel serverless function: forwards Emma's requests to Claude.
// The API key is read from the ANTHROPIC_API_KEY environment variable
// (set it in Vercel → Project → Settings → Environment Variables). Never put it in code.

const MODEL = process.env.EMMA_MODEL || "claude-haiku-5-5";
const MAX_TURNS = 16;
const MAX_CHARS = 6000;

// Very small per-IP limit to protect your credit (resets when the function cold-starts).
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 30; // 30 requests per minute per device
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(503).json({ error: "Server has no ANTHROPIC_API_KEY" });

  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  if (limited(ip)) return res.status(429).json({ error: "Too many requests" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = null; } }
  const raw = Array.isArray(body?.messages) ? body.messages.slice(-MAX_TURNS) : null;
  if (!raw || !raw.length) return res.status(400).json({ error: "messages required" });

  // Clean and merge consecutive turns with the same role.
  const messages = [];
  for (const m of raw) {
    const role = m?.role === "assistant" ? "assistant" : "user";
    const content = String(m?.content || "").slice(0, MAX_CHARS).trim();
    if (!content) continue;
    const last = messages[messages.length - 1];
    if (last && last.role === role) last.content += "\n\n" + content;
    else messages.push({ role, content });
  }
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user")
    return res.status(400).json({ error: "last message must be from the student" });

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        system:
          "You are Emma, a kind English teaching assistant for Vietnamese children. Always keep content child-safe and follow the format the user turn asks for.",
        messages,
      }),
    });
    const data = await r.json();
    if (!r.ok) {
      console.error("Anthropic error", r.status, data?.error?.message);
      return res.status(r.status === 429 ? 429 : (r.status === 401 || r.status === 403) ? 401 : 502).json({ error: data?.error?.type || "upstream_error" });
    }
    const text = (data.content || []).map((c) => c.text || "").join("");
    return res.status(200).json({ text });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: "upstream_error" });
  }
}
