export interface ReviewerCard {
  id: string;
  name: string;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
}

// A seed that stays constant for the whole day but changes each day, so fake
// queue numbers fluctuate day to day (e.g. 7 today, 3 tomorrow, 10 the next).
export function todaySeed(): number {
  return Math.floor(Date.now() / 86_400_000);
}

// A deterministic "busy" number in the range 3–10 for a reviewer on a given
// day. Stable within the day, varies by reviewer and by day.
export function fakeLoad(reviewerId: string, daySeed: number): number {
  let h = daySeed >>> 0;
  for (let i = 0; i < reviewerId.length; i++) {
    h = (h * 31 + reviewerId.charCodeAt(i)) >>> 0;
  }
  return 3 + (h % 8); // 3..10
}

// The number we actually SHOW under a reviewer.
// Rule: 3 or more real students waiting → show the real count.
// Fewer than 3 real → show a lively fake number instead.
export function displayedLoad(reviewerId: string, realCount: number, daySeed: number): number {
  if (realCount >= 3) return realCount;
  return fakeLoad(reviewerId, daySeed);
}

// Turn-around derived from how busy the reviewer looks. Capped at ~2 days,
// faster when the queue is light.
export function turnaroundLabel(load: number): string {
  if (load <= 4) return "Usually within 1 day";
  if (load <= 7) return "Usually within 2 days";
  return "About 2 days";
}
