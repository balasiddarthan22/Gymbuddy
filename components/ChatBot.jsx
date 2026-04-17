'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ExerciseCard from './ExerciseCard';

const EQUIPMENT_OPTIONS = [
  'Dumbbells', 'Barbell', 'Cable machine', 'Resistance bands', 'Pull-up bar',
  'Leg press machine', 'Bench', 'Smith machine', 'Bodyweight only', 'Kettlebells',
  'Treadmill', 'Rowing machine', 'Battle ropes', 'Dip bars', 'EZ bar',
  'Lat pulldown machine', 'Chest press machine', 'Shoulder press machine',
  'Hack squat machine', 'Preacher curl bench', 'Incline bench', 'Decline bench',
  'Ankle weights', 'TRX / suspension trainer',
];

const PRESET_PROMPTS = [
  { label: '💪 Build muscle', defaults: { goal: 'Build strength & muscle', muscles: ['Chest', 'Back', 'Shoulders'], equipment: ['Dumbbells', 'Barbell'], level: 'Intermediate', intensity: 'Hard — push my limits' } },
  { label: '🔥 Burn fat',     defaults: { goal: 'Lose weight & get leaner', muscles: ['Full body'], equipment: ['Bodyweight only'], level: 'Some experience', intensity: 'Moderate — solid sweat' } },
  { label: '🦵 Leg day',      defaults: { goal: 'Build strength & muscle', muscles: ['Legs', 'Glutes'], equipment: ['Barbell', 'Leg press machine'], level: 'Intermediate', intensity: 'Hard — push my limits' } },
  { label: '💫 Upper body',   defaults: { goal: 'Build strength & muscle', muscles: ['Chest', 'Shoulders', 'Biceps', 'Triceps'], equipment: ['Dumbbells', 'Lat pulldown machine'], level: 'Some experience', intensity: 'Moderate — solid sweat' } },
  { label: '🧘 Core & abs',   defaults: { goal: 'Tone up & feel confident', muscles: ['Core'], equipment: ['Bodyweight only'], level: 'Complete beginner', intensity: 'Light — easy going' } },
  { label: '⚡ Quick 20 min', defaults: { goal: 'Improve fitness & endurance', muscles: ['Full body'], equipment: ['Bodyweight only'], level: 'Some experience', intensity: 'Light — easy going' } },
];

const STEPS = [
  {
    key: 'goal',
    bot: "Hey! I'm GymBuddy — your personal AI trainer 💪 What's your main goal?",
    type: 'single',
    options: ['Build strength & muscle', 'Lose weight & get leaner', 'Improve fitness & endurance', 'Tone up & feel confident'],
  },
  {
    key: 'muscles',
    bot: 'Which muscle groups do you want to focus on today? Pick one or more.',
    type: 'multi',
    options: ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Glutes', 'Core', 'Full body'],
  },
  {
    key: 'equipment',
    bot: 'What equipment do you have? Type to search, click to add, then hit Done.',
    type: 'autocomplete',
  },
  {
    key: 'level',
    bot: "What's your fitness level?",
    type: 'single',
    options: ['Complete beginner', 'Some experience', 'Intermediate', 'Advanced'],
  },
  {
    key: 'intensity',
    bot: "Last one — how intense do you want today's session?",
    type: 'single',
    options: ['Light — easy going', 'Moderate — solid sweat', 'Hard — push my limits'],
  },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function SingleChips({ step, onSelect, suggested }) {
  return (
    <div className="chips-grid">
      {step.options.map((opt) => (
        <button key={opt} className={`chip${opt === suggested ? ' suggested' : ''}`} onClick={() => onSelect(step.key, opt, opt)}>
          {opt === suggested ? '✓ ' : ''}{opt}
        </button>
      ))}
    </div>
  );
}

function MultiChips({ step, onConfirm, defaultSelected = [] }) {
  const [selected, setSelected] = useState(new Set(defaultSelected));
  function toggle(opt) {
    setSelected((s) => { const n = new Set(s); n.has(opt) ? n.delete(opt) : n.add(opt); return n; });
  }
  return (
    <div>
      <div className="chips-grid">
        {step.options.map((opt) => (
          <button key={opt} className={`chip${selected.has(opt) ? ' selected' : ''}`} onClick={() => toggle(opt)}>{opt}</button>
        ))}
      </div>
      <button className="confirm-btn" disabled={selected.size === 0} onClick={() => { const arr = [...selected]; onConfirm(step.key, arr, arr.join(', ')); }}>
        Confirm ✓
      </button>
    </div>
  );
}

function AutocompleteInput({ step, onConfirm, defaultSelected = [] }) {
  const [inputVal, setInputVal] = useState('');
  const [selected, setSelected] = useState(defaultSelected);
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  function handleInput(e) {
    const q = e.target.value;
    setInputVal(q);
    if (!q.trim()) { setSuggestions([]); return; }
    setSuggestions(EQUIPMENT_OPTIONS.filter(o => o.toLowerCase().includes(q.toLowerCase()) && !selected.includes(o)));
  }

  function addItem(item) {
    const val = item.trim();
    if (!val || selected.includes(val)) return;
    setSelected(s => [...s, val]);
    setInputVal('');
    setSuggestions([]);
    inputRef.current?.focus();
  }

  return (
    <div>
      <div className="equip-tags">
        {selected.map(s => (
          <div key={s} className="equip-tag">
            <span>{s}</span>
            <button onClick={() => setSelected(p => p.filter(x => x !== s))}>×</button>
          </div>
        ))}
      </div>
      <div className="equip-input-wrap">
        <input
          ref={inputRef}
          className="equip-input"
          value={inputVal}
          onChange={handleInput}
          onKeyDown={e => { if (e.key === 'Enter' && inputVal.trim()) { e.preventDefault(); addItem(inputVal); } if (e.key === 'Escape') setSuggestions([]); }}
          onBlur={() => setTimeout(() => setSuggestions([]), 150)}
          placeholder="e.g. Dumbbells, Barbell…"
          autoComplete="off"
        />
        {suggestions.length > 0 && (
          <div className="autocomplete-dropdown">
            {suggestions.map(s => (
              <div key={s} className="autocomplete-item" onMouseDown={e => { e.preventDefault(); addItem(s); }}>{s}</div>
            ))}
          </div>
        )}
      </div>
      <button className="confirm-btn" disabled={selected.length === 0} onClick={() => onConfirm(step.key, selected, selected.join(', '))} style={{ marginTop: '10px' }}>
        Done ✓
      </button>
    </div>
  );
}

function PlanResult({ plan }) {
  return (
    <div className="msg plan-msg">
      <div className="msg-avatar bot-avatar"><img src="/logo.png" alt="GB" style={{width:'100%',height:'100%',objectFit:'contain'}} /></div>
      <div className="plan-bubble">
        <div className="plan-header-chat">
          <div>
            <div className="plan-title">{plan.planTitle}</div>
            <div className="plan-subtitle">{plan.planSubtitle}</div>
          </div>
          <div className="plan-badge">AI Generated</div>
        </div>
        {plan.exercises.map((ex, i) => <ExerciseCard key={i} exercise={ex} index={i} />)}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function ChatBot() {
  const router = useRouter();
  const [theme, setTheme] = useState('light');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeInput, setActiveInput] = useState(null);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [presetDefaults, setPresetDefaults] = useState(null);
  const chatState = useRef({ goal: '', muscles: [], equipment: [], level: '', intensity: '' });
  const windowRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : '');
  }, [theme]);

  useEffect(() => {
    const t = setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages([{ type: 'bot', text: STEPS[0].bot }]);
        setActiveInput(STEPS[0].type);
      }, 800);
    }, 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (windowRef.current) windowRef.current.scrollTop = windowRef.current.scrollHeight;
  }, [messages, isTyping, plan]);

  function advance(key, value, displayText) {
    const newState = { ...chatState.current, [key]: value };
    chatState.current = newState;
    setMessages(m => [...m, { type: 'user', text: displayText }]);
    setActiveInput(null);
    const next = currentStep + 1;
    setCurrentStep(next);
    if (next >= STEPS.length) {
      setTimeout(() => doGenerate(newState), 500);
      return;
    }
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(m => [...m, { type: 'bot', text: STEPS[next].bot }]);
      setActiveInput(STEPS[next].type);
    }, 1000);
  }

  function handlePreset(preset) {
    chatState.current = { ...preset.defaults };
    setPresetDefaults(preset.defaults);
    setMessages(m => [...m, { type: 'user', text: preset.label }]);
    setActiveInput(null);
    setCurrentStep(0);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(m => [...m, { type: 'bot', text: STEPS[0].bot }]);
      setActiveInput(STEPS[0].type);
    }, 800);
  }

  function advanceWithPreset() {
    if (!presetDefaults || !stepData) return;
    const value = presetDefaults[stepData.key];
    const displayText = Array.isArray(value) ? value.join(', ') : value;
    advance(stepData.key, value, displayText);
  }

  async function handleTextSend() {
    const text = textInput.trim();
    if (!text || isTyping) return;
    setTextInput('');
    setActiveInput(null);
    const newMessages = [...messages, { type: 'user', text }];
    setMessages(newMessages);
    setIsTyping(true);
    setError(null);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setIsTyping(false);
      if (data.error) { setError(data.error); return; }
      if (data.type === 'plan') {
        if (data.reply) setMessages(m => [...m, { type: 'bot', text: data.reply }]);
        setPlan(data.plan);
      } else {
        setMessages(m => [...m, { type: 'bot', text: data.reply }]);
      }
    } catch (e) {
      setIsTyping(false);
      setError(e.message);
    }
  }

  async function doGenerate(state) {
    setIsTyping(true);
    setError(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state ?? chatState.current),
      });
      const data = await res.json();
      setIsTyping(false);
      if (!res.ok || data.error) { setError(data.error ?? `Error ${res.status}`); return; }
      setPlan(data.plan);
    } catch (e) {
      setIsTyping(false);
      setError(e.message);
    }
  }

  function reset() {
    chatState.current = { goal: '', muscles: [], equipment: [], level: '', intensity: '' };
    setMessages([]);
    setIsTyping(false);
    setCurrentStep(0);
    setActiveInput(null);
    setPlan(null);
    setError(null);
    setTextInput('');
    setPresetDefaults(null);
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages([{ type: 'bot', text: STEPS[0].bot }]);
        setActiveInput(STEPS[0].type);
      }, 800);
    }, 300);
  }

  const stepData = currentStep < STEPS.length ? STEPS[currentStep] : null;
  const showPresets = !plan && currentStep === 0 && activeInput !== null;
  const showTextInput = activeInput !== 'autocomplete';

  return (
    <>
      <nav className="navbar">
        <div className="logo">
          GymBuddy
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className="browse-btn" onClick={() => router.push('/workouts')}>🏋️ Browse workouts</button>
          <button className="theme-toggle" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </nav>

      <div className="chat-outer">
        <div className="chat-window" ref={windowRef}>
          {messages.map((msg, i) => (
            <div key={i} className={`msg ${msg.type}`}>
              {msg.type === 'bot' && <div className="msg-avatar bot-avatar"><img src="/logo.png" alt="GB" style={{width:'100%',height:'100%',objectFit:'contain'}} /></div>}
              <div className="msg-bubble">{msg.text}</div>
            </div>
          ))}
          {isTyping && (
            <div className="msg bot">
              <div className="msg-avatar bot-avatar"><img src="/logo.png" alt="GB" style={{width:'100%',height:'100%',objectFit:'contain'}} /></div>
              <div className="msg-bubble typing-bubble"><span /><span /><span /></div>
            </div>
          )}
          {error && (
            <div className="msg bot">
              <div className="msg-avatar bot-avatar"><img src="/logo.png" alt="GB" style={{width:'100%',height:'100%',objectFit:'contain'}} /></div>
              <div className="msg-bubble">Something went wrong: {error}</div>
            </div>
          )}
          {plan && <PlanResult plan={plan} />}
        </div>

        <div className="chat-input-area">
          {showPresets && (
            <div className="preset-prompts">
              {PRESET_PROMPTS.map(p => (
                <button key={p.label} className="preset-chip" onClick={() => handlePreset(p)}>{p.label}</button>
              ))}
            </div>
          )}

          {activeInput === 'single'       && stepData && <SingleChips       step={stepData} onSelect={advance} suggested={presetDefaults?.[stepData.key]} />}
          {activeInput === 'multi'        && stepData && <MultiChips        step={stepData} onConfirm={advance} defaultSelected={presetDefaults?.[stepData.key] ?? []} />}
          {activeInput === 'autocomplete' && stepData && <AutocompleteInput step={stepData} onConfirm={advance} defaultSelected={presetDefaults?.[stepData.key] ?? []} />}

          {presetDefaults && activeInput && (
            <button className="use-suggested-btn" onClick={advanceWithPreset}>
              Use suggestion and continue →
            </button>
          )}

          {showTextInput && (
            <div className="chat-text-row">
              <input
                className="chat-text-input"
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTextSend(); } }}
                placeholder={activeInput ? 'Or type your own request…' : 'Tell GymBuddy what you want…'}
                disabled={isTyping}
                suppressHydrationWarning
              />
              <button className="send-btn" onClick={handleTextSend} disabled={!textInput.trim() || isTyping}>↑</button>
            </div>
          )}

          {!plan && !error && (
            <button className="skip-btn" onClick={() => router.push('/workouts')}>
              🏋️ Take me to my workout
            </button>
          )}

          {error && (
            <button className="confirm-btn" style={{ marginTop: '8px' }} onClick={() => doGenerate()}>
              Try again
            </button>
          )}
          {plan && <button className="reset-btn" onClick={reset}>↺  Start over</button>}
        </div>
      </div>
    </>
  );
}
