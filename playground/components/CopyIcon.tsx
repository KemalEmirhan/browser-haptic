type CopyIconProps = { className?: string; size?: number };

export const CopyIcon = ({ className = "", size = 18 }: CopyIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden
  >
    {/* Back square (lower-left, partially obscured) */}
    <rect x="2" y="8" width="12" height="12" rx="2" />
    {/* Front square (upper-right, on top) */}
    <rect x="10" y="2" width="12" height="12" rx="2" />
  </svg>
);
