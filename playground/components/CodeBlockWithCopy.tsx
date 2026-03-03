"use client";

import { useState, useCallback, useEffect } from "react";

type CodeBlockWithCopyProps = {
  code: string;
  className?: string;
};

const BLUR_DURATION_MS = 100;

const CopyIconSvg = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    className={`h-6 w-6 ${className}`}
    aria-hidden
  >
    <path
      d="M9 9V5.25C9 4.00736 10.0074 3 11.25 3H18.75C19.9926 3 21 4.00736 21 5.25V12.75C21 13.9926 19.9926 15 18.75 15H15M12.75 9H5.25C4.00736 9 3 10.0074 3 11.25V18.75C3 19.9926 4.00736 21 5.25 21H12.75C13.9926 21 15 19.9926 15 18.75V11.25C15 10.0074 13.9926 9 12.75 9Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CopiedIconSvg = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    className={`h-6 w-6 ${className}`}
    aria-hidden
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM15.774 10.1333C16.1237 9.70582 16.0607 9.0758 15.6332 8.72607C15.2058 8.37635 14.5758 8.43935 14.226 8.86679L10.4258 13.5116L9.20711 12.2929C8.81658 11.9024 8.18342 11.9024 7.79289 12.2929C7.40237 12.6834 7.40237 13.3166 7.79289 13.7071L9.79289 15.7071C9.99267 15.9069 10.2676 16.0129 10.5498 15.9988C10.832 15.9847 11.095 15.8519 11.274 15.6333L15.774 10.1333Z"
      fill="currentColor"
    />
  </svg>
);

export const CodeBlockWithCopy = ({ code, className = "" }: CodeBlockWithCopyProps) => {
  const [copied, setCopied] = useState(false);
  const [isBlurring, setIsBlurring] = useState(false);

  const copyToClipboard = useCallback((text: string): boolean => {
    const trimmed = text.trim();
    if (!trimmed) return false;
    try {
      const textarea = document.createElement("textarea");
      textarea.value = trimmed;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "0";
      textarea.style.left = "0";
      textarea.style.width = "2em";
      textarea.style.height = "2em";
      textarea.style.padding = "0";
      textarea.style.border = "none";
      textarea.style.outline = "none";
      textarea.style.boxShadow = "none";
      textarea.style.background = "transparent";
      textarea.style.opacity = "0";
      textarea.setAttribute("aria-hidden", "true");
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, trimmed.length);
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  }, []);

  const handleCopy = useCallback(() => {
    const text = code.trim();
    if (!text) return;
    // Use sync fallback first so it runs in the same user-gesture tick (fixes iOS/mobile)
    let success = copyToClipboard(text);
    if (!success && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(
        () => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        },
        () => {}
      );
      return;
    }
    setCopied(success);
    if (success) setTimeout(() => setCopied(false), 2000);
  }, [code, copyToClipboard]);

  useEffect(() => {
    setIsBlurring(true);
    const t = setTimeout(() => setIsBlurring(false), BLUR_DURATION_MS);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--code-bg)] ${className}`}
    >
      <pre className="overflow-x-auto p-4 pr-12 text-sm font-mono leading-5 text-[var(--text)]">
        <code>{code.trim()}</code>
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCopy();
          }
        }}
        className="absolute right-2 top-2 flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-md text-slate-500 transition-transform duration-150 ease-out hover:bg-[var(--border)]/50 hover:text-slate-700 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--code-bg)]"
        aria-label={copied ? "Copied" : "Copy code"}
      >
        <span
          className={`inline-flex items-center justify-center transition-[filter] duration-100 ease-out ${
            isBlurring ? "[filter:blur(1px)]" : "[filter:blur(0)]"
          }`}
        >
          {copied ? (
            <CopiedIconSvg className="text-slate-600" />
          ) : (
            <CopyIconSvg />
          )}
        </span>
      </button>
    </div>
  );
};
