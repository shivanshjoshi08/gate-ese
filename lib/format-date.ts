/** App default timezone (GATE / ESE learners in India). */
export const APP_TIME_ZONE = "Asia/Kolkata";

const dateTimeFmt = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: APP_TIME_ZONE,
});

export type DateInput = string | number | Date | null | undefined;

export function formatDateTime(value: DateInput, fallback = "—"): string {
  if (value == null || value === "") return fallback;
  const d =
    value instanceof Date
      ? value
      : typeof value === "number"
        ? new Date(value)
        : new Date(value);
  if (Number.isNaN(d.getTime())) return fallback;
  return dateTimeFmt.format(d);
}

export function formatRelative(value: DateInput): string {
  if (value == null || value === "") return "Never";
  const then =
    value instanceof Date
      ? value.getTime()
      : typeof value === "number"
        ? value
        : new Date(value).getTime();
  if (Number.isNaN(then)) return "—";
  const ms = Date.now() - then;
  if (ms < 0) return formatDateTime(value);
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 14) return `${days}d ago`;
  return formatDateTime(value);
}
