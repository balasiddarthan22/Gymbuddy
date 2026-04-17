import { NextResponse } from 'next/server';

export async function POST(request) {
  const { messages } = await request.json();

  const systemInstruction = `You are GymBuddy, a friendly and motivating personal trainer AI.

When the user asks for a workout, exercise plan, or wants to train specific muscles, generate a complete plan.
For general fitness questions or casual chat, respond conversationally.

ALWAYS respond with ONLY a valid JSON object — no markdown, no backticks, no extra text.

For workout plans:
{
  "type": "plan",
  "reply": "One short encouraging sentence",
  "plan": {
    "planTitle": "Short catchy plan name",
    "planSubtitle": "5 exercises · 45 mins · Intermediate",
    "exercises": [
      {
        "name": "Exercise name",
        "sets": "3 sets x 10 reps",
        "muscle": "Primary muscle group",
        "description": "One encouraging sentence about form or benefit.",
        "youtubeSearch": "exercise name tutorial"
      }
    ]
  }
}

For conversational replies:
{
  "type": "text",
  "reply": "Your helpful response here"
}

Include 5-6 exercises for workout plans. Be warm and motivating.`;

  const contents = messages
    .filter(m => m.text)
    .map(m => ({
      role: m.type === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

  const apiKey = process.env.GEMINI_API_KEY;
  const models = ['gemini-2.5-flash'];
  let lastError = null;

  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents,
          }),
        }
      );

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        lastError = `[${model}] ${res.status}: ${errBody?.error?.message ?? 'unknown'}`;
        if (res.status === 403 || res.status === 401 || res.status === 400) break;
        continue;
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) { lastError = 'Empty response'; continue; }

      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      return NextResponse.json(parsed);
    } catch (e) {
      lastError = e.message;
    }
  }

  return NextResponse.json({ error: lastError ?? 'All models failed' }, { status: 500 });
}
