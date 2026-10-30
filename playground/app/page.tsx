"use client";

import type { ReactNode } from "react";
import { SiGithub, SiNpm } from "react-icons/si";
import { useHaptic } from "@/components/useHaptic";
import { HapticDemo } from "@/components/HapticDemo";
import { InstallSection } from "@/components/InstallSection";
import { UsageSection } from "@/components/UsageSection";

const REPO_URL = "https://github.com/KemalEmirhan/browser-haptic";
const NPM_URL = "https://www.npmjs.com/package/browser-haptic";

const FooterLink = ({ href, label, children }: { href: string; label: string; children: ReactNode }) => {
  const ref = useHaptic<HTMLAnchorElement>();
  return (
    <a
      ref={ref}
      href={href}
      aria-label={label}
      className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-[var(--text)] transition hover:bg-[var(--border)] hover:text-[var(--accent)]"
    >
      {children}
    </a>
  );
};

export default function PlaygroundPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-16 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          browser-haptic
        </h1>
        <p className="mt-3 text-lg text-[var(--muted)]">
          Haptic feedback for the web: vibration on Android, native ticks on
          iPhone.
        </p>
      </header>

      <div className="space-y-12">
        <HapticDemo />
        <InstallSection />
        <UsageSection />
      </div>

      <footer className="mt-16 border-t border-[var(--border)] pt-8">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <FooterLink href={NPM_URL} label="npm package">
            <SiNpm size={28} />
          </FooterLink>
          <FooterLink href={REPO_URL} label="GitHub repository">
            <SiGithub size={24} />
          </FooterLink>
        </div>
        <p className="mt-4 text-center text-xs text-[var(--muted)]">
          © 2026 Emirhan Kemal Kosem
        </p>
      </footer>
    </div>
  );
}
