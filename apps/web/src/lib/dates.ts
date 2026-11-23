/** The person's own calendar date (`YYYY-MM-DD`), which decides what "today" means for them. */
export function localToday(now = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

/** Adds days to an ISO calendar date, in UTC so the result never shifts with time zones. */
export function addDays(iso: string, days: number): string {
  return new Date(Date.parse(iso) + days * 86_400_000).toISOString().slice(0, 10);
}
