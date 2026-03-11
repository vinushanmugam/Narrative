// api/generate.js — Narrative serverless function
// Reads ANTHROPIC_API_KEY from environment (.env locally, Vercel env vars in prod)
// Returns: { narrative, tagline, chapters, values, closingLine } or { error }

export default async function handler(req, res) {
  // ── CORS + method guard ───────────────────────────────────────────────────
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // ── API key guard ─────────────────────────────────────────────────────────
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY is not set in environment");
    return res.status(500).json({ error: "API key not configured. Add ANTHROPIC_API_KEY to your .env file." });
  }

  // ── Input ─────────────────────────────────────────────────────────────────
  const { name, careerHistory, sabbatical, movingToward, extraContext, skills, closingLine } = req.body || {};
  if (!name || !careerHistory) {
    return res.status(400).json({ error: "Missing required fields: name, careerHistory" });
  }

  // ── Prompt ────────────────────────────────────────────────────────────────
  const prompt = `You are Narrative, a warm and literary career storytelling AI. Turn the interview answers below into a polished career profile.

STRICT RULES:
- Use ONLY the information the person actually stated. Never invent details.
- Copy real job titles, company names, and dates exactly as written.
- Write in first person ("I") — warm, human, literary tone. Never corporate.
- Chapters must reflect their actual roles and gaps, in chronological order.
- Skills must come exactly from what they listed.
- If a detail is missing, use [brackets] as a placeholder — never guess.

INTERVIEW ANSWERS:
NAME: ${name}
CAREER HISTORY: ${careerHistory}
SABBATICAL / GAP: ${sabbatical || "Not provided"}
MOVING TOWARD: ${movingToward || "Not specified"}
SKILLS: ${skills || "Not provided"}
EXTRA CONTEXT: ${extraContext || "None"}
CLOSING LINE: ${closingLine || "Not provided"}

Return ONLY a valid JSON object with exactly these fields — no markdown, no backticks, no explanation:

{
  "tagline": "8-12 word human description of their journey (not a job title)",
  "narrative": "3-4 sentences, first person, referencing their specific roles, gap, and direction. Warm and literary.",
  "chapters": [
    {
      "period": "exact dates from their history e.g. Feb 2008 – Feb 2009",
      "title": "Evocative 2-4 word chapter name",
      "description": "1-2 sentences about what they actually did and what it built in them"
    }
  ],
  "values": [
    {
      "icon": "single emoji",
      "title": "2-3 word value",
      "description": "One sentence grounded in something they actually shared"
    }
  ],
  "closingLine": "One memorable sentence echoing their own words or spirit"
}

Produce exactly 4 values. Chapters should match every role and gap they mentioned.`;

  // ── Call Anthropic ────────────────────────────────────────────────────────
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Anthropic API error ${response.status}:`, errText);
      return res.status(response.status).json({ error: `Anthropic API error: ${response.status}` });
    }

    const data = await response.json();
    const raw = data.content.map((b) => b.text || "").join("").trim();

    // Strip any accidental markdown fences
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON in response:", raw.slice(0, 300));
      return res.status(500).json({ error: "AI returned unexpected format" });
    }

    const profile = JSON.parse(jsonMatch[0]);

    // Validate required fields
    const required = ["tagline", "narrative", "chapters", "values", "closingLine"];
    for (const field of required) {
      if (!profile[field]) {
        return res.status(500).json({ error: `AI response missing field: ${field}` });
      }
    }

    return res.status(200).json(profile);

  } catch (err) {
    console.error("generate.js error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
