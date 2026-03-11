export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, careerHistory, sabbatical, movingToward, extraContext } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': process.env.ANTHROPIC_API_KEY,   // ← key lives here, server-side only
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: `Write a 3-4 sentence first-person career narrative for this person. Use ONLY the facts below. Do not add anything not mentioned. Be warm, honest, and literary.

NAME: ${name}
CAREER HISTORY: ${careerHistory}
SABBATICAL / GAP: ${sabbatical}
MOVING TOWARD: ${movingToward}
EXTRA CONTEXT: ${extraContext || 'none'}

Return ONLY the narrative paragraph — no intro, no JSON, no labels. Just the paragraph itself.`
        }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    const narrative = data.content.map(b => b.text || '').join('').trim();
    return res.status(200).json({ narrative });

  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
