const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Format a date as a short, human-friendly relative label.
 * Mirrors the web frontend's formatLastStudied (decks/page.tsx):
 * "Never" | "Today" | "Yesterday" | "N days ago" | short date.
 */
export function formatRelativeDate(dateStr?: string | null): string {
  if (!dateStr) return 'Never';

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Never';

  // Compare calendar days, not raw 24h windows
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const now = new Date();
  const diffDays = Math.round(
    (startOfDay(now).getTime() - startOfDay(date).getTime()) / MS_PER_DAY
  );

  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }

  // Older: short date, drop the year when it's the current one
  return formatShortDate(dateStr);
}

/**
 * Short calendar date, e.g. "Jun 15" or "Jun 15, 2025" (year only when
 * it differs from the current year). Returns '' for missing/invalid input.
 */
export function formatShortDate(dateStr?: string | null): string {
  if (!dateStr) return '';

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    ...(date.getFullYear() !== new Date().getFullYear() && { year: 'numeric' }),
  });
}
