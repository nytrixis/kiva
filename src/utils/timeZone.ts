import { toZonedTime } from 'date-fns-tz';
import { formatDistanceToNow } from 'date-fns';

export function formatTimeAgo(timestamp: string): string {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const utcDate = new Date(timestamp + (timestamp.endsWith('Z') ? '' : 'Z'));
  const localTime = toZonedTime(utcDate, userTimeZone);
  return formatDistanceToNow(localTime, { addSuffix: true });
}

export function getUserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}