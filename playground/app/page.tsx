import { SiGithub, SiNpm } from "react-icons/si";
import { HapticDemo } from "@/components/HapticDemo";
import { InstallSection } from "@/components/InstallSection";
import { UsageSection } from "@/components/UsageSection";

const REPO_URL = "https://github.com/KemalEmirhan/browser-haptic";
const NPM_URL = "https://www.npmjs.com/package/browser-haptic";

export default function PlaygroundPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-16 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          browser-haptic
        </h1>
        <p className="mt-3 text-lg text-[var(--muted)]">
          Lightweight haptic feedback for the web. Vibration API + iOS Safari
          17.4+ fallback.
        </p>
      </header>

      <div className="space-y-12">
        <HapticDemo />
        <InstallSection />
        <UsageSection />
      </div>

      <footer className="mt-16 border-t border-[var(--border)] pt-8">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href={NPM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded p-2 text-[var(--text)] transition hover:bg-[var(--border)] hover:text-[var(--accent)]"
            aria-label="npm package"
          >
            <SiNpm size={28} />
          </a>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded p-2 text-[var(--text)] transition hover:bg-[var(--border)] hover:text-[var(--accent)]"
            aria-label="GitHub repository"
          >
            <SiGithub size={22} />
          </a>
        </div>
        <p className="mt-4 text-center text-xs text-[var(--muted)]">
          © 2026 Emirhan Kemal Kosem
        </p>
      </footer>
    </div>
  );
}
