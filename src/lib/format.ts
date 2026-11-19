const relativeTimeFormat = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Colombo",
});

export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const diffMs = now.getTime() - new Date(iso).getTime();
  const seconds = Math.max(0, Math.floor(diffMs / 1000));

  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return relativeTimeFormat.format(-minutes, "minute");

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return relativeTimeFormat.format(-hours, "hour");

  const days = Math.floor(hours / 24);
  if (days < 7) return relativeTimeFormat.format(-days, "day");
  if (days < 30) return relativeTimeFormat.format(-Math.floor(days / 7), "week");
  if (days < 365) return relativeTimeFormat.format(-Math.floor(days / 30), "month");
  return relativeTimeFormat.format(-Math.floor(days / 365), "year");
}

export function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso));
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
