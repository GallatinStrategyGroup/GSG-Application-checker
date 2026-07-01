import type { ServiceKey } from "@/lib/services";

type IconProps = { className?: string };

// Simple, consistent line icons for the three services.
function IconSpark({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className}>
      <path d="M12 3l1.8 4.9L18.7 9.7l-4.9 1.8L12 16.4l-1.8-4.9L5.3 9.7l4.9-1.8L12 3z" strokeLinejoin="round" />
      <path d="M18.5 15.5l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7.7-1.9z" strokeLinejoin="round" />
    </svg>
  );
}

function IconDoc({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className}>
      <path d="M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" strokeLinejoin="round" />
      <path d="M14 3v4h4" strokeLinejoin="round" />
      <path d="M9 13l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconUsers({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" strokeLinecap="round" />
      <path d="M16 5.2a3.2 3.2 0 0 1 0 5.6" strokeLinecap="round" />
      <path d="M17 14.2A5.5 5.5 0 0 1 20.5 19" strokeLinecap="round" />
    </svg>
  );
}

export function ServiceIcon({ service, className }: { service: ServiceKey; className?: string }) {
  if (service === "ec") return <IconSpark className={className} />;
  if (service === "application") return <IconDoc className={className} />;
  return <IconUsers className={className} />;
}
