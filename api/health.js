// Tells the page whether the server has a Claude key (never returns the key itself).
export default function handler(req, res) {
  const key = process.env.ANTHROPIC_API_KEY || "";
  res.status(200).json({ ai: key.length > 20, model: process.env.EMMA_MODEL || "claude-haiku-5-5" });
}
