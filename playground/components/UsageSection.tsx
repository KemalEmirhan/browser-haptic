"use client";

import { useState, useLayoutEffect, useRef } from "react";
import { SiReact, SiTypescript, SiVuedotjs, SiSvelte, SiAngular } from "react-icons/si";
import { CodeBlockWithCopy } from "./CodeBlockWithCopy";
import { HapticButton } from "./HapticButton";

const REACT_CODE = `import { useEffect, useRef } from "react";
import Haptic from "browser-haptic";

const SaveButton = () => {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => Haptic.attach(ref.current!, "success"), []);
  return <button ref={ref} onClick={save}>Save</button>;
};`;

const TYPESCRIPT_CODE = `import Haptic from "browser-haptic";

const button = document.querySelector<HTMLButtonElement>("#save")!;
const detach = Haptic.attach(button, "success");

// Later, when the button goes away
detach();`;

const VUE_CODE = `<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import Haptic from "browser-haptic";

const button = ref();
let detach;
onMounted(() => (detach = Haptic.attach(button.value, "success")));
onUnmounted(() => detach?.());
</script>

<template>
  <button ref="button" @click="save">Save</button>
</template>`;

const SVELTE_CODE = `<script>
  import Haptic from "browser-haptic";

  const haptic = (node, preset) => ({ destroy: Haptic.attach(node, preset) });
</script>

<button use:haptic={"success"} on:click={save}>
  Save
</button>`;

const ANGULAR_CODE = `import { Directive, ElementRef, Input, OnDestroy, OnInit } from "@angular/core";
import Haptic, { type HapticPresetName } from "browser-haptic";

@Directive({ selector: "[haptic]", standalone: true })
export class HapticDirective implements OnInit, OnDestroy {
  @Input() haptic: HapticPresetName = "light";
  private detach = () => {};
  constructor(private el: ElementRef<HTMLElement>) {}
  ngOnInit() { this.detach = Haptic.attach(this.el.nativeElement, this.haptic); }
  ngOnDestroy() { this.detach(); }
}

// <button haptic="success" (click)="save()">Save</button>`;

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
      <h2 className="mb-2 text-xl font-semibold text-[var(--text)]">Usage</h2>
      <p className="mb-4 text-sm text-[var(--muted)]">
        Attach feedback to an element once. On iPhone, <code className="font-mono text-[var(--text)]">attach()</code> covers
        it with an invisible native switch, so the user&apos;s own tap plays the tick. Since iOS 26.5 this is the
        only way to get haptics on iPhone. On Android it vibrates with the preset.
      </p>
      <div
        ref={containerRef}
        className="tab-bar"
        style={{ "--active-anchor": `--tab-${active}` } as React.CSSProperties}
      >
        <div className="tab-slider" aria-hidden />
        {FRAMEWORKS.map((fw) => {
          const Icon = fw.Icon;
          return (
            <HapticButton
              key={fw.id}
              data-tab={fw.id}
              onClick={() => setActive(fw.id)}
              style={{ anchorName: `--tab-${fw.id}` } as React.CSSProperties}
              className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
              aria-label={`Show ${fw.label} example`}
              aria-pressed={active === fw.id}
            >
              <Icon size={18} className="shrink-0" style={{ color: fw.iconColor }} />
              {fw.label}
            </HapticButton>
          );
        })}
      </div>
      <div className="mt-4">
        <CodeBlockWithCopy code={current.code} />
      </div>
    </section>
  );
};
