"use client";

import { useState, useEffect } from "react";
import Haptic, { type HapticPresetName } from "browser-haptic";
import { HapticButton } from "./HapticButton";

type Platform = "vibration" | "iphone" | "desktop" | "none";

const NEUTRAL = "bg-slate-50 text-slate-800 border-slate-200";

/* Light/medium/heavy share one neutral tint (a strength scale); outcomes get their own color. */
const PRESETS: { preset: HapticPresetName; label: string; desc: string; color: string }[] = [
  { preset: "light", label: "Light", desc: "15ms tap", color: NEUTRAL },
  { preset: "medium", label: "Medium", desc: "25ms tap", color: NEUTRAL },
  { preset: "heavy", label: "Heavy", desc: "40ms tap", color: NEUTRAL },
  { preset: "success", label: "Success", desc: "Two pulses", color: "bg-green-50 text-green-800 border-green-200" },
  { preset: "warning", label: "Warning", desc: "Two longer pulses", color: "bg-amber-50 text-amber-800 border-amber-200" },
  { preset: "error", label: "Error", desc: "Three pulses", color: "bg-red-50 text-red-800 border-red-200" },
];

const STATUS: Record<Platform, { dot: string; text: string }> = {
  vibration: {
    dot: "bg-green-500",
    text: "Vibration is available. Each preset has its own pattern.",
  },
  iphone: {
    dot: "bg-green-500",
    text: "iPhone: each tap plays one native tick. iOS has no strength control, so every preset feels the same.",
  },
  desktop: {
    dot: "bg-slate-400",
    text: "This browser supports vibration, but this device has no motor. Open this page on an Android phone or an iPhone to feel it.",
  },
  none: {
    dot: "bg-slate-400",
    text: "This browser has no haptics. Open this page on an Android phone or an iPhone (Safari 17.4+) to feel it.",
  },
};

const parsePattern = (s: string): number[] =>
  s
    .split(/[\s,]+/)
    .map((n) => parseInt(n, 10))
    .filter((n) => !Number.isNaN(n) && n >= 0);

const detectPlatform = (): Platform => {
  if (Haptic.hasVibration()) {
    // Desktop Chrome exposes navigator.vibrate but has nothing to vibrate.
    return window.matchMedia("(pointer: coarse)").matches ? "vibration" : "desktop";
  }
  if (Haptic.isSupported()) return "iphone";
  return "none";
};

export const HapticDemo = () => {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [customPattern, setCustomPattern] = useState("10, 50, 10, 50, 10");

  useEffect(() => setPlatform(detectPlatform()), []);

  const showDetails = platform === "vibration";

  const handleCustomVibrate = () => {
    const pattern = parsePattern(customPattern);
    Haptic.vibrate(pattern.length > 0 ? pattern : 15);
  };

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
      <h2 className="mb-2 text-xl font-semibold text-[var(--text)]">Try it</h2>
      <p className="flex min-h-[2.5rem] items-start gap-2 text-sm text-[var(--muted)]" aria-live="polite">
        {platform && (
          <>
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${STATUS[platform].dot}`} aria-hidden />
            <span>{STATUS[platform].text}</span>
          </>
        )}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {PRESETS.map(({ preset, label, desc, color }) => (
          <HapticButton
            key={preset}
            preset={preset}
            className={`btn-press flex min-h-[64px] flex-col items-center justify-center rounded-xl px-4 py-3 text-sm ${color}`}
            aria-label={`${label} haptic`}
          >
            <span>{label}</span>
            {showDetails && <span className="mt-0.5 text-xs font-normal opacity-70">{desc}</span>}
          </HapticButton>
        ))}
      </div>

      {showDetails && (
        <div className="mt-6">
          <label htmlFor="custom-pattern" className="mb-2 block text-sm font-medium text-[var(--text)]">
            Custom pattern
            <span className="ml-2 font-normal text-[var(--muted)]">ms: vibrate, pause, vibrate…</span>
          </label>
          <div className="flex gap-2">
            <input
              id="custom-pattern"
              type="text"
              value={customPattern}
              onChange={(e) => setCustomPattern(e.target.value)}
              placeholder="10, 50, 10"
              className="min-h-[44px] min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 font-mono text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus-visible:border-[var(--accent)] focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
            />
            <button
              type="button"
              onClick={handleCustomVibrate}
              className="btn-press min-h-[44px] shrink-0 rounded-lg border-slate-300 bg-slate-100 px-4 text-sm text-slate-900"
            >
              Vibrate
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
