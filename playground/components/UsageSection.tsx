"use client";

import { useState, useLayoutEffect, useRef } from "react";
import { SiReact, SiTypescript, SiVuedotjs, SiSvelte, SiAngular } from "react-icons/si";
import { CodeBlockWithCopy } from "./CodeBlockWithCopy";

const REACT_CODE = `import Haptic from "browser-haptic";

const MyButton = () => (
  <button onClick={() => Haptic.heavy()}>
    Tap me
  </button>
);

if (Haptic.isSupported()) {
  Haptic.success();
}`;

const TYPESCRIPT_CODE = `import Haptic from "browser-haptic";

if (Haptic.isSupported()) {
  Haptic.light();
  Haptic.success();
  Haptic.vibrate([10, 50, 10]);
}`;

const VUE_CODE = `<script setup>
  import Haptic from "browser-haptic";

  const handleClick = () => Haptic.light();
</script>

<template>
  <button @click="handleClick">Tap me</button>
</template>`;

const SVELTE_CODE = `<script>
  import Haptic from "browser-haptic";

  const handleClick = () => Haptic.medium();
</script>

<button on:click={handleClick}>
  Tap me
</button>`;

const ANGULAR_CODE = `import { Component } from "@angular/core";
import Haptic from "browser-haptic";

@Component({
  selector: "app-button",
  template: \`<button (click)="onTap()">Tap</button>\`,
})
export class ButtonComponent {
  onTap() {
    Haptic.heavy();
  }
}`;

const FRAMEWORKS = [
  { id: "react", label: "React", code: REACT_CODE, Icon: SiReact, iconColor: "#61dafb" },
  { id: "typescript", label: "TypeScript", code: TYPESCRIPT_CODE, Icon: SiTypescript, iconColor: "#3178c6" },
  { id: "vue", label: "Vue", code: VUE_CODE, Icon: SiVuedotjs, iconColor: "#42b883" },
  { id: "svelte", label: "Svelte", code: SVELTE_CODE, Icon: SiSvelte, iconColor: "#ff3e00" },
  { id: "angular", label: "Angular", code: ANGULAR_CODE, Icon: SiAngular, iconColor: "#dd0031" },
] as const;

export const UsageSection = () => {
  const [active, setActive] = useState<(typeof FRAMEWORKS)[number]["id"]>("react");
  const containerRef = useRef<HTMLDivElement>(null);
  const current = FRAMEWORKS.find((f) => f.id === active) ?? FRAMEWORKS[0];

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
      <h2 className="mb-4 text-xl font-semibold text-[var(--text)]">Usage</h2>
      <div
        ref={containerRef}
        className="tab-bar"
        style={{ "--active-anchor": `--tab-${active}` } as React.CSSProperties}
      >
        <div className="tab-slider" aria-hidden />
        {FRAMEWORKS.map((fw) => {
          const Icon = fw.Icon;
          return (
            <button
              key={fw.id}
              type="button"
              data-tab={fw.id}
              onClick={() => setActive(fw.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActive(fw.id);
                }
              }}
              style={{ anchorName: `--tab-${fw.id}` } as React.CSSProperties}
              className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
              aria-label={`Show ${fw.label} example`}
              aria-pressed={active === fw.id}
            >
              <Icon size={18} className="shrink-0" style={{ color: fw.iconColor }} />
              {fw.label}
            </button>
          );
        })}
      </div>
      <div className="mt-4">
        <CodeBlockWithCopy code={current.code} />
      </div>
    </section>
  );
};
