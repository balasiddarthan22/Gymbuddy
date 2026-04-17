import { NextResponse } from 'next/server';

export async function POST(request) {
  const { goal, muscles, equipment, level, intensity } = await request.json();

  const prompt = `You are GymBuddy, a friendly and encouraging personal trainer AI.
Create a workout plan for someone with these details:
- Goal: ${goal}
- Muscle groups to focus on: ${Array.isArray(muscles) ? muscles.join(', ') : muscles}
- Fitness level: ${level}
- Intensity: ${intensity}
- Available equipment: ${Array.isArray(equipment) ? equipment.join(', ') : equipment}

Return ONLY a valid JSON object with NO markdown, NO backticks, NO extra text. Use this exact structure:
{
  "planTitle": "short catchy plan name",
  "planSubtitle": "5 exercises · 45 mins · Beginner",
  "exercises": [
    {
      "name": "Exercise name",
      "sets": "3 sets x 10 reps",
      "muscle": "Primary muscle group",
      "description": "One encouraging sentence about form or why this helps their goal.",
      "youtubeSearch": "exercise name tutorial for beginners"
    }
  ]
}

Include 5-6 exercises appropriate for their level and equipment. Be encouraging and specific to the muscle groups requested.`;

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
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        lastError = `[${model}] ${res.status}: ${errBody?.error?.message ?? 'unknown'}`;
        if (res.status === 403 || res.status === 401) break; // bad key, don't retry
        continue; // try next model on 404/503
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) { lastError = 'Empty response'; continue; }

      const clean = text.replace(/```json|```/g, '').trim();
      const plan = JSON.parse(clean);
      return NextResponse.json({ plan });

    } catch (e) {
      lastError = e.message;
    }
  }

  return NextResponse.json({ error: lastError ?? 'All models failed' }, { status: 500 });
}
