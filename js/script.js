// ============================================
// GymBuddy — script.js
// Replace YOUR_GEMINI_API_KEY with your key
// Get one free at https://aistudio.google.com
// ============================================

const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';

const state = {
  goal: '',
  level: '',
  intensity: '',
  equipment: []
};

// Theme toggle
function toggleTheme() {
  const isDark = document.body.getAttribute('data-theme') === 'dark';
  document.body.setAttribute('data-theme', isDark ? '' : 'dark');
  document.getElementById('themeBtn').textContent = isDark ? 'Dark mode' : 'Light mode';
}

// Single select options
function selectOption(key, value, btn) {
  state[key] = value;
  btn.parentElement.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

// Multi select equipment
function toggleEquip(item, btn) {
  const idx = state.equipment.indexOf(item);
  if (idx === -1) {
    state.equipment.push(item);
    btn.classList.add('selected');
  } else {
    state.equipment.splice(idx, 1);
    btn.classList.remove('selected');
  }
}

// Generate workout plan
async function generatePlan() {
  const err = document.getElementById('errorMsg');

  if (!state.goal || !state.level || !state.intensity || state.equipment.length === 0) {
    err.style.display = 'block';
    return;
  }
  err.style.display = 'none';

  document.getElementById('formSection').style.display = 'none';

  const loading = document.createElement('div');
  loading.className = 'loading';
  loading.id = 'loadingDiv';
  loading.innerHTML = `
    <div class="spinner"></div>
    <p>Building your personalised plan with AI...</p>
  `;
  document.querySelector('.container').appendChild(loading);

  const prompt = `You are GymBuddy, a friendly and encouraging personal trainer AI for beginners.
Create a workout plan for someone with these details:
- Goal: ${state.goal}
- Fitness level: ${state.level}
- Intensity: ${state.intensity}
- Available equipment: ${state.equipment.join(', ')}

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

Include 5-6 exercises appropriate for their level and equipment. Be encouraging and beginner-friendly.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await res.json();
    const text = data.candidates[0].content.parts[0].text;
    const clean = text.replace(/```json|```/g, '').trim();
    const plan = JSON.parse(clean);
    renderPlan(plan);

  } catch (e) {
    console.error(e);
    loading.innerHTML = '<p style="color:var(--gb-muted)">Something went wrong. Check your API key and try again.</p>';
  }
}

// Render the workout plan
function renderPlan(plan) {
  document.getElementById('loadingDiv')?.remove();
  document.getElementById('planTitle').textContent = plan.planTitle;
  document.getElementById('planSubtitle').textContent = plan.planSubtitle;

  const list = document.getElementById('exerciseList');
  list.innerHTML = '';

  plan.exercises.forEach((ex, i) => {
    const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.youtubeSearch)}`;

    const card = document.createElement('div');
    card.className = 'exercise-card';
    card.innerHTML = `
      <div class="exercise-top">
        <div class="exercise-gif">🏋️</div>
        <div class="exercise-info">
          <div class="exercise-name">${i + 1}. ${ex.name}</div>
          <div class="exercise-meta">
            <span class="meta-tag">${ex.sets}</span>
            <span class="meta-tag">${ex.muscle}</span>
          </div>
          <div class="exercise-desc">${ex.description}</div>
          <a class="yt-link" href="${ytUrl}" target="_blank">▶ Watch tutorial</a>
        </div>
      </div>
    `;
    list.appendChild(card);
  });

  document.getElementById('resultsSection').classList.add('show');
}

// Reset form
function resetForm() {
  state.goal = '';
  state.level = '';
  state.intensity = '';
  state.equipment = [];

  document.querySelectorAll('.option-btn, .eq-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('resultsSection').classList.remove('show');
  document.getElementById('formSection').style.display = 'block';
}
