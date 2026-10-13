import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, SkipForward, Timer } from "lucide-react";
import ToolHeader from "./ToolHeader";
import { card, input, label, primaryButton, secondaryButton } from "./toolStyles";

type Mode = "focus" | "short" | "long";

const MODE_LABEL: Record<Mode, string> = {
  focus: "ফোকাস",
  short: "ছোট বিরতি",
  long: "লম্বা বিরতি",
};

const STORAGE_KEY = "gb_focus_timer";
const DEFAULT_MINUTES: Record<Mode, number> = { focus: 25, short: 5, long: 15 };
// A long break replaces the short one after this many focus sessions.
const SESSIONS_PER_ROUND = 4;

const loadMinutes = (): Record<Mode, number> => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    return { ...DEFAULT_MINUTES, ...(saved ?? {}) };
  } catch {
    return DEFAULT_MINUTES;
  }
};

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

// Two short tones, generated on the fly so no audio file is needed.
const playChime = () => {
  try {
    const ctx = new AudioContext();
    [0, 0.25].forEach((offset, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = i === 0 ? 660 : 880;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + offset + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.45);
    });
    setTimeout(() => ctx.close(), 1200);
  } catch {
    // No audio available; the on-screen change is enough.
  }
};

const RADIUS = 120;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const FocusTimer = () => {
  const [minutes, setMinutes] = useState(loadMinutes);
  const [mode, setMode] = useState<Mode>("focus");
  const [secondsLeft, setSecondsLeft] = useState(() => loadMinutes().focus * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState(0);
  // Wall-clock deadline: the countdown stays correct even when the browser
  // throttles timers in a background tab.
  const endsAtRef = useRef<number | null>(null);

  const totalSeconds = minutes[mode] * 60;

  const switchMode = useCallback(
    (next: Mode, autoStart = false) => {
      setMode(next);
      setSecondsLeft(minutes[next] * 60);
      setIsRunning(autoStart);
      endsAtRef.current = autoStart ? Date.now() + minutes[next] * 60 * 1000 : null;
    },
    [minutes]
  );

  const finishSession = useCallback(() => {
    playChime();
    if (mode === "focus") {
      const done = completed + 1;
      setCompleted(done);
      switchMode(done % SESSIONS_PER_ROUND === 0 ? "long" : "short");
    } else {
      switchMode("focus");
    }
  }, [mode, completed, switchMode]);

  useEffect(() => {
    if (!isRunning) return;
    const tick = () => {
      const remaining = Math.max(0, Math.round(((endsAtRef.current ?? Date.now()) - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) finishSession();
    };
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [isRunning, finishSession]);

  // Show the countdown in the tab title while this page is open.
  useEffect(() => {
    const original = document.title;
    document.title = `${formatTime(secondsLeft)} · ${MODE_LABEL[mode]}`;
    return () => {
      document.title = original;
    };
  }, [secondsLeft, mode]);

  const toggle = () => {
    if (isRunning) {
      setIsRunning(false);
      endsAtRef.current = null;
    } else {
      endsAtRef.current = Date.now() + secondsLeft * 1000;
      setIsRunning(true);
    }
  };

  const changeMinutes = (target: Mode, value: string) => {
    const parsed = Math.min(180, Math.max(1, Math.round(Number(value) || 1)));
    const next = { ...minutes, [target]: parsed };
    setMinutes(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage unavailable; the setting just won't persist.
    }
    if (target === mode && !isRunning) setSecondsLeft(parsed * 60);
  };

  const progress = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 0;
  const isBreak = mode !== "focus";

  return (
    <>
      <ToolHeader
        icon={Timer}
        title="ফোকাস টাইমার"
        desc="পোমোডোরো পদ্ধতি: নির্দিষ্ট সময় একটানা পড়ো, তারপর ছোট বিরতি নাও। চারটা সেশনের পর একটা লম্বা বিরতি।"
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-start">
        <div className={`${card} flex flex-col items-center`}>
          <div className="flex w-full gap-1 rounded-xl bg-stone-100 p-1" role="group" aria-label="সেশনের ধরন">
            {(Object.keys(MODE_LABEL) as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => switchMode(m)}
                className={`flex-1 rounded-lg px-2 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  mode === m ? "bg-stone-900 text-white shadow-sm" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {MODE_LABEL[m]}
              </button>
            ))}
          </div>

          <div className="relative my-8 w-full max-w-[18rem]">
            <svg viewBox="0 0 280 280" className="block w-full -rotate-90" aria-hidden="true">
              <circle cx="140" cy="140" r={RADIUS} fill="none" strokeWidth="12" className="stroke-stone-100" />
              <circle
                cx="140"
                cy="140"
                r={RADIUS}
                fill="none"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
                className={`transition-[stroke-dashoffset] duration-300 ease-linear ${isBreak ? "stroke-emerald-500" : "stroke-amber-400"}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p role="timer" aria-live="off" className="font-display text-6xl font-extrabold tabular-nums text-stone-900">
                {formatTime(secondsLeft)}
              </p>
              <p className="mt-1 text-sm font-semibold text-stone-500">{MODE_LABEL[mode]}</p>
            </div>
          </div>

          <div className="flex w-full flex-wrap justify-center gap-3">
            <button type="button" onClick={toggle} className={`${primaryButton} min-w-[9rem]`}>
              {isRunning ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
              {isRunning ? "থামাও" : "শুরু করো"}
            </button>
            <button type="button" onClick={() => switchMode(mode)} className={secondaryButton}>
              <RotateCcw size={16} aria-hidden="true" /> রিসেট
            </button>
            <button type="button" onClick={finishSession} className={secondaryButton}>
              <SkipForward size={16} aria-hidden="true" /> পরেরটা
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className={card}>
            <p className="text-sm font-semibold text-stone-500">আজকের সেশনে শেষ হয়েছে</p>
            <p className="mt-1 font-display text-4xl font-extrabold text-stone-900">
              {completed}
              <span className="ml-2 text-base font-semibold text-stone-400">ফোকাস সেশন</span>
            </p>
            <div className="mt-4 flex gap-2" aria-hidden="true">
              {Array.from({ length: SESSIONS_PER_ROUND }).map((_, i) => (
                <span
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
                    i < completed % SESSIONS_PER_ROUND || (completed > 0 && completed % SESSIONS_PER_ROUND === 0 && mode === "long")
                      ? "bg-amber-400"
                      : "bg-stone-100"
                  }`}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-stone-500">পেজ বন্ধ করলে এই গণনা নতুন করে শুরু হবে।</p>
          </div>

          <div className={card}>
            <p className="mb-4 font-display text-lg font-bold text-stone-900">সময় ঠিক করো (মিনিট)</p>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(MODE_LABEL) as Mode[]).map((m) => (
                <label key={m} className="block">
                  <span className={label}>{MODE_LABEL[m]}</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={180}
                    value={minutes[m]}
                    onChange={(e) => changeMinutes(m, e.target.value)}
                    className={input}
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FocusTimer;
