/** A lens lifted over a bar: the moment a tab is pressed. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <rect x="1.5" y="11" width="29" height="10" rx="5" fill="currentColor" fillOpacity=".22" />
      <rect
        x="12"
        y="6.5"
        width="17"
        height="19"
        rx="8.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <path
        d="M16.2 12.2a3.6 3.6 0 0 1 3.1-2.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
