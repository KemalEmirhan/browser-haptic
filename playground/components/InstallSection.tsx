"use client";

import { useState, useLayoutEffect, useRef } from "react";
import { CodeBlockWithCopy } from "./CodeBlockWithCopy";

const PACKAGE_MANAGERS = [
  { id: "npm", label: "npm", command: "npm i browser-haptic" },
  { id: "pnpm", label: "pnpm", command: "pnpm add browser-haptic" },
  { id: "yarn", label: "yarn", command: "yarn add browser-haptic" },
  { id: "bun", label: "bun", command: "bun add browser-haptic" },
] as const;

export const InstallSection = () => {
  const [active, setActive] = useState<(typeof PACKAGE_MANAGERS)[number]["id"]>("npm");
  const containerRef = useRef<HTMLDivElement>(null);
  const current = PACKAGE_MANAGERS.find((p) => p.id === active) ?? PACKAGE_MANAGERS[0];

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const updateSlider = () => {
      const activeEl = container.querySelector<HTMLElement>(`[data-tab="${active}"]`);
      if (!activeEl) return;
      const containerRect = container.getBoundingClientRect();
      const rect = activeEl.getBoundingClientRect();
      container.style.setProperty("--slider-left", `${rect.left - containerRect.left}px`);
      container.style.setProperty("--slider-top", `${rect.top - containerRect.top}px`);
      container.style.setProperty("--slider-width", `${rect.width}px`);
      container.style.setProperty("--slider-height", `${rect.height}px`);
    };
    updateSlider();
    const ro = new ResizeObserver(updateSlider);
    ro.observe(container);
    return () => ro.disconnect();
  }, [active]);

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold text-[var(--text)]">Install</h2>
      <div
        ref={containerRef}
        className="tab-bar"
        style={{ "--active-anchor": `--tab-${active}` } as React.CSSProperties}
      >
        <div className="tab-slider" aria-hidden />
        {PACKAGE_MANAGERS.map((pm) => (
          <button
            key={pm.id}
            type="button"
            data-tab={pm.id}
            onClick={() => setActive(pm.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setActive(pm.id);
              }
            }}
            style={{ anchorName: `--tab-${pm.id}` } as React.CSSProperties}
            className="rounded-md px-4 py-2 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
            aria-label={`Install with ${pm.label}`}
            aria-pressed={active === pm.id}
          >
            {pm.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        <CodeBlockWithCopy code={current.command} />
      </div>
    </section>
  );
};
