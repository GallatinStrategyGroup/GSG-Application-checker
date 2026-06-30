// A round avatar. Shows the photo if we have one, otherwise the person's
// initials on a soft blue circle (used for the sample reviewers).
export function Avatar({ name, url, size = 48 }: { name: string; url: string | null; size?: number }) {
  if (url) {
    return (
      // Plain <img>: reviewer photos can come from anywhere, so we skip
      // next/image remote-domain config. Avatars are tiny, so LCP isn't a concern.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <span
      className="flex items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
