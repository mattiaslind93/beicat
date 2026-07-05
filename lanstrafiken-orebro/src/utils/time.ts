/** "14:07" ur ett Date, lokal tid. */
export function formatClock(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/** Minuter kvar till en tidpunkt, aldrig negativt. */
export function minutesUntil(date: Date, from: Date = new Date()): number {
  return Math.max(0, Math.round((date.getTime() - from.getTime()) / 60_000));
}

/** Försening i hela minuter mellan tidtabell och realtidsprognos. */
export function delayMinutes(scheduled: Date, realtime?: Date): number {
  if (!realtime) return 0;
  return Math.round((realtime.getTime() - scheduled.getTime()) / 60_000);
}

/** "5 jul 14:07" för störningsperioder (unix-sekunder). */
export function formatDateTime(unixSeconds: number, locale: string): string {
  return new Date(unixSeconds * 1000).toLocaleString(locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
