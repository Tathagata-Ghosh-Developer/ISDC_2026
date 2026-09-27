/** Shared formatting helpers. Indian digit grouping throughout. */

export function formatINR(n: number, withPaise = false): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: withPaise ? 2 : 0,
    maximumFractionDigits: withPaise ? 2 : 0,
  }).format(n);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-IN").format(n);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(d);
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(d);
}

/** Digits only, last ten, so pasted numbers with +91 or spaces still work. */
export function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

/** A moment as the date and time on a clock in India: "2026-10-16", "18:30". */
export function istParts(ms: number): { date: string; time: string } {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(ms)
      .map((x) => [x.type, x.value]),
  );
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}

/** The calendar day in India on which an instant falls: "2026-10-16". */
export function istDay(iso: string | null | undefined): string {
  const ms = iso ? Date.parse(iso) : NaN;
  return Number.isNaN(ms) ? "" : istParts(ms).date;
}

/**
 * A from/to pair of Indian calendar days as the instants that bound them,
 * for filtering a timestamp column: from the first instant of `from` up
 * to, but not including, the first instant of the day after `to`. A side
 * that is missing, malformed or not a real date ("2026-13-01") is open.
 */
export function istDayRange(from?: string | null, to?: string | null): { gte?: string; lt?: string } {
  const start = (d?: string | null) => {
    if (!d || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
    const ms = Date.parse(`${d}T00:00:00+05:30`);
    // Reject dates the parser quietly rolls over, like 31 April.
    return Number.isNaN(ms) || istParts(ms).date !== d ? null : ms;
  };
  const f = start(from);
  const t = start(to);
  return {
    ...(f !== null ? { gte: new Date(f).toISOString() } : {}),
    ...(t !== null ? { lt: new Date(t + 86_400_000).toISOString() } : {}),
  };
}

/** A date and time typed in India, as an instant. Null if either is malformed. */
export function istToIso(date: string, time: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return null;
  const d = new Date(`${date}T${time}:00+05:30`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
