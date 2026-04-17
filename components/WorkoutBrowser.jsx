'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ExerciseCard from './ExerciseCard';

const CATALOG = [
  { id: 'push',       name: 'Push Day',            emoji: '💪', category: 'Strength', muscles: ['Chest', 'Shoulders', 'Triceps'], difficulty: 'Intermediate', duration: '45', equipment: ['Dumbbells', 'Bench', 'Barbell'] },
  { id: 'pull',       name: 'Pull Day',             emoji: '🏋️', category: 'Strength', muscles: ['Back', 'Biceps'],              difficulty: 'Intermediate', duration: '45', equipment: ['Dumbbells', 'Pull-up bar'] },
  { id: 'legs',       name: 'Leg Day',              emoji: '🦵', category: 'Strength', muscles: ['Legs', 'Glutes'],              difficulty: 'Intermediate', duration: '50', equipment: ['Barbell', 'Leg press machine'] },
  { id: 'full-body',  name: 'Full Body',            emoji: '🔥', category: 'Strength', muscles: ['Full body'],                   difficulty: 'Beginner',     duration: '45', equipment: ['Dumbbells'] },
  { id: 'bodyweight', name: 'Bodyweight Circuit',   emoji: '🤸', category: 'Cardio',   muscles: ['Full body'],                   difficulty: 'Beginner',     duration: '30', equipment: ['Bodyweight only'] },
  { id: 'hiit',       name: 'HIIT Cardio',          emoji: '⚡', category: 'Cardio',   muscles: ['Full body'],                   difficulty: 'Advanced',     duration: '25', equipment: ['Bodyweight only'] },
  { id: 'upper',      name: 'Upper Body Power',     emoji: '💫', category: 'Strength', muscles: ['Chest', 'Back', 'Shoulders'], difficulty: 'Intermediate', duration: '50', equipment: ['Dumbbells', 'Barbell'] },
  { id: 'core',       name: 'Core & Abs',           emoji: '🧘', category: 'Core',     muscles: ['Core'],                       difficulty: 'Beginner',     duration: '25', equipment: ['Bodyweight only'] },
  { id: 'glutes',     name: 'Glute Sculptor',       emoji: '🍑', category: 'Strength', muscles: ['Glutes', 'Legs'],             difficulty: 'Beginner',     duration: '40', equipment: ['Dumbbells', 'Resistance bands'] },
  { id: 'arms',       name: 'Arms & Shoulders',     emoji: '🏆', category: 'Strength', muscles: ['Biceps', 'Triceps', 'Shoulders'], difficulty: 'Intermediate', duration: '40', equipment: ['Dumbbells', 'EZ bar'] },
  { id: 'endurance',  name: 'Cardio Endurance',     emoji: '🏃', category: 'Cardio',   muscles: ['Full body'],                   difficulty: 'Intermediate', duration: '40', equipment: ['Treadmill'] },
  { id: 'beginner',   name: 'Beginner Starter',     emoji: '🌟', category: 'General',  muscles: ['Full body'],                   difficulty: 'Beginner',     duration: '30', equipment: ['Bodyweight only'] },
];

const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const CATEGORIES    = ['All', 'Strength', 'Cardio', 'Core', 'General'];

export default function WorkoutBrowser() {
  const router = useRouter();
  const [theme, setTheme] = useState('light');
  const [search, setSearch]       = useState('');
  const [diffFilter, setDiff]     = useState('All');
  const [catFilter,  setCat]      = useState('All');
  const [generated, setGenerated] = useState({});

  useEffect(() => {
    const saved = document.documentElement.getAttribute('data-theme');
    if (saved === 'dark') setTheme('dark');
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : '');
  }, [theme]);

  const filtered = CATALOG.filter(w => {
    if (diffFilter !== 'All' && w.difficulty !== diffFilter) return false;
    if (catFilter  !== 'All' && w.category  !== catFilter)  return false;
    if (search) {
      const q = search.toLowerCase();
      if (!w.name.toLowerCase().includes(q) && !w.muscles.join(' ').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  async function generate(w) {
    setGenerated(g => ({ ...g, [w.id]: { loading: true, plan: null, error: null } }));
    try {
      const intensityMap = { Beginner: 'Light — easy going', Intermediate: 'Moderate — solid sweat', Advanced: 'Hard — push my limits' };
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: w.category === 'Cardio' ? 'Improve fitness & endurance' : 'Build strength & muscle',
          muscles: w.muscles,
          equipment: w.equipment,
          level: w.difficulty,
          intensity: intensityMap[w.difficulty] ?? 'Moderate — solid sweat',
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setGenerated(g => ({ ...g, [w.id]: { loading: false, plan: null, error: data.error ?? `Error ${res.status}` } }));
      } else {
        setGenerated(g => ({ ...g, [w.id]: { loading: false, plan: data.plan, error: null } }));
      }
    } catch (e) {
      setGenerated(g => ({ ...g, [w.id]: { loading: false, plan: null, error: e.message } }));
    }
  }

  return (
    <div className="workouts-page">
      <nav className="navbar">
        <div className="logo">
          GymBuddy
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className="browse-btn" onClick={() => router.push('/')}>← Back to chat</button>
          <button className="theme-toggle" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </nav>

      <div className="workouts-content">
        <div className="workouts-header">
          <h1 className="workouts-title">Browse Workouts</h1>
          <p className="workouts-sub">Explore {CATALOG.length} ready-to-generate workout plans</p>
        </div>

        <div className="filter-bar">
          <input
            className="search-input"
            placeholder="Search workouts or muscles…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="filter-group">
            {DIFFICULTIES.map(d => (
              <button key={d} className={`filter-chip${diffFilter === d ? ' active' : ''}`} onClick={() => setDiff(d)}>{d}</button>
            ))}
          </div>
          <div className="filter-group">
            {CATEGORIES.map(c => (
              <button key={c} className={`filter-chip${catFilter === c ? ' active' : ''}`} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
        </div>

        <div className="workout-grid">
          {filtered.map(w => {
            const gen = generated[w.id];
            return (
              <div key={w.id} className="workout-catalog-card">
                <div className="wc-header">
                  <span className="wc-emoji">{w.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div className="wc-name">{w.name}</div>
                    <div className="wc-meta">{w.muscles.join(' · ')} · {w.duration} min</div>
                  </div>
                  <span className={`wc-badge wc-cat-${w.category.toLowerCase()}`}>{w.difficulty}</span>
                </div>

                {!gen?.plan && (
                  <button className="generate-btn" onClick={() => generate(w)} disabled={gen?.loading}>
                    {gen?.loading ? '⏳ Generating…' : gen?.error ? '↺ Try again' : '⚡ Generate workout'}
                  </button>
                )}
                {gen?.error && <p className="error-bubble">{gen.error}</p>}

                {gen?.plan && (
                  <div className="wc-exercises">
                    <div className="wc-plan-title">{gen.plan.planTitle}</div>
                    {gen.plan.exercises.map((ex, i) => <ExerciseCard key={i} exercise={ex} index={i} />)}
                    <button className="reset-btn" style={{ marginTop: '12px' }} onClick={() => setGenerated(g => ({ ...g, [w.id]: null }))}>
                      ↺ Regenerate
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && <p className="no-results">No workouts match your filters.</p>}
        </div>
      </div>
    </div>
  );
}
