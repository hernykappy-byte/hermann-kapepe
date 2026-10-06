// Zambia is on Central Africa Time all year (UTC+2, no daylight saving).
const CAT_OFFSET_MS = 2 * 60 * 60 * 1000;

export function lusakaDay(now: Date = new Date()): string {
  const t = new Date(now.getTime() + CAT_OFFSET_MS);
  return t.toISOString().slice(0, 10);
}

export function msUntilNextLusakaDay(now: Date = new Date()): number {
  const t = new Date(now.getTime() + CAT_OFFSET_MS);
  const next = Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate() + 1, 0, 0, 0);
  return next - (now.getTime() + CAT_OFFSET_MS);
}

export function dayDiff(a: string, b: string): number {
  return Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / 86400000);
}
