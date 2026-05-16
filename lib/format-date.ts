/** App default timezone (GATE / ESE learners in India). */
export const APP_TIME_ZONE = "Asia/Kolkata";

const dateTimeFmt = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: APP_TIME_ZONE,
});

export function formatDateTime(
  iso: string | Date | null | undefined,
  fallback = "—",
): string {
  if (!iso) return fallback;
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return fallback;
  return dateTimeFmt.format(d);
}

export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "Never";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const ms = Date.now() - then;
  if (ms < 0) return formatDateTime(iso);
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 14) return `${days}d ago`;
  return formatDateTime(iso);
}
