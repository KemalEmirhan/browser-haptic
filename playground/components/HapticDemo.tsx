"use client";

import { useState, useEffect } from "react";
import Haptic from "browser-haptic";

/* iOS-style system tints: soft fills, matching borders */
const BUTTONS = [
  { label: "Light", method: () => Haptic.light(), desc: "Short tap", color: "bg-slate-100 text-slate-700 border-slate-300" },
  { label: "Medium", method: () => Haptic.medium(), desc: "Medium tap", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { label: "Heavy", method: () => Haptic.heavy(), desc: "Strong tap", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { label: "Success", method: () => Haptic.success(), desc: "Double tap", color: "bg-green-50 text-green-700 border-green-200" },
  { label: "Warning", method: () => Haptic.warning(), desc: "Triple tap", color: "bg-orange-50 text-orange-700 border-orange-200" },
  { label: "Error", method: () => Haptic.error(), desc: "Alert pattern", color: "bg-red-50 text-red-700 border-red-200" },
] as const;

const parsePattern = (s: string): number[] =>
  s
    .split(/[\s,]+/)
    .map((n) => parseInt(n, 10))
    .filter((n) => !Number.isNaN(n) && n >= 0);

export const HapticDemo = () => {
  const [mounted, setMounted] = useState(false);
  const [customPattern, setCustomPattern] = useState("10, 50, 10, 50, 10");

  useEffect(() => {
    setMounted(true);
  }, []);

  const supported = mounted && Haptic.isSupported();
  const hasVibration = mounted && Haptic.hasVibration();

  const handleClick = (method: () => void) => {
    method();
  };

  const handleKeyDown = (e: React.KeyboardEvent, method: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      method();
    }
  };

  const handleCustomVibrate = () => {
    const pattern = parsePattern(customPattern);
    if (pattern.length > 0) Haptic.vibrate(pattern);
  };

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
      <h2 className="mb-2 text-xl font-semibold text-[var(--text)]">Try it</h2>
      <p className="mb-4 text-sm text-[var(--muted)]">
        Tap the buttons below. Best experienced on a real device (Android or iOS
        Safari 17.4+).
      </p>
      {supported && !hasVibration && (
        <p className="mb-4 rounded-lg bg-violet-50 px-3 py-2 text-sm text-violet-800 border border-violet-200">
          Using iOS switch fallback (no Vibration API).
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        {BUTTONS.map(({ label, method, desc, color }) => (
          <button
            key={label}
            type="button"
            onClick={() => handleClick(method)}
            onKeyDown={(e) => handleKeyDown(e, method)}
            className={`btn-press rounded-xl px-4 py-3 text-sm ${color}`}
            aria-label={`Trigger ${label} haptic: ${desc}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={customPattern}
          onChange={(e) => setCustomPattern(e.target.value)}
          placeholder="e.g. 10, 50, 10"
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-mono text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          aria-label="Custom vibration pattern (numbers, comma or space separated)"
        />
        <button
          type="button"
          onClick={handleCustomVibrate}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleCustomVibrate();
            }
          }}
          className="btn-press rounded-lg bg-slate-200 px-3 py-2 text-xs text-slate-900 border-slate-300"
          aria-label="Trigger custom pattern"
        >
          Try custom
        </button>
      </div>
    </section>
  );
};
