// The three things a visitor can choose on the homepage.
// (Distinct from the internal checker "types" — Application Check maps to the
// finished/partial checkers, Counseling is its own flow.)

export type ServiceKey = "ec" | "application" | "counseling";

export interface Service {
  key: ServiceKey;
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
  href: string;
  cta: string;
  priceLabel: string;
  featured?: boolean;
}

export const SERVICES: Service[] = [
  {
    key: "ec",
    eyebrow: "Quick check",
    title: "EC Check",
    description:
      "Find out whether your extracurriculars are strong enough for your target schools — and exactly how to make them stronger.",
    points: ["Activity-by-activity read", "Tailored to your school list"],
    href: "/start/ec",
    cta: "Check my ECs",
    priceLabel: "From $63.99",
  },
  {
    key: "application",
    eyebrow: "Most popular",
    title: "Application Check",
    description:
      "Submit your whole application — finished or still in progress — and get detailed, written feedback from a counselor.",
    points: ["Finished or work-in-progress", "Essays, activities & supplements"],
    href: "/apply",
    cta: "Check my application",
    priceLabel: "From $189.99",
  },
  {
    key: "counseling",
    eyebrow: "1-on-1",
    title: "Full Counseling",
    description:
      "Work directly with the best counselors in the country. Browse their profiles and book a free intro call to get started.",
    points: ["Free 15-minute intro call", "Personalized, ongoing guidance"],
    href: "/counseling",
    cta: "Meet the counselors",
    priceLabel: "Free intro call",
    featured: true,
  },
];
