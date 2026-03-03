type CodeBlockProps = {
  title: string;
  code: string;
  lang?: string;
};

export const CodeBlock = ({ title, code, lang = "ts" }: CodeBlockProps) => (
  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
    <div className="border-b border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-sm font-medium text-[var(--muted)]">
      {title}
    </div>
    <pre className="overflow-x-auto p-4 text-sm">
      <code className={`language-${lang}`}>{code.trim()}</code>
    </pre>
  </div>
);
