// The Gallatin "growth line" constellation mark — crisp SVG, sharp at any size.
export function BrandMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} role="img" aria-label="Gallatin Strategy Group">
      <rect width="32" height="32" rx="8" fill="#1e3a8a" />
      <polyline
        points="6,22 12,17 18,19 24,12 27.5,9.5"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
      <g fill="#ffffff">
        <circle cx="6" cy="22" r="1.8" />
        <circle cx="12" cy="17" r="1.8" />
        <circle cx="18" cy="19" r="1.8" />
        <circle cx="24" cy="12" r="1.8" />
        <circle cx="27.5" cy="9.5" r="1.8" />
      </g>
    </svg>
  );
}
