type Size = "sm" | "md" | "lg" | "full";

const widths: Record<Size, string> = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-3xl",
  full: "max-w-6xl",
};

export function Container({
  size = "full",
  className = "",
  children,
}: {
  size?: Size;
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={`mx-auto w-full ${widths[size]} px-6 ${className}`}>{children}</div>;
}
