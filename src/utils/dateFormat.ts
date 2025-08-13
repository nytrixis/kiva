import { toZonedTime } from 'date-fns-tz';
import { formatDistanceToNow } from 'date-fns';

export function formatTimeAgo(timestamp: string): string {
  try {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Handle different date formats from database
    let dateString = timestamp;
    
    // If the date doesn't end with 'Z' and doesn't have timezone info, assume it's UTC
    if (!dateString.endsWith('Z') && !dateString.includes('+') && !dateString.includes('-', 10)) {
      dateString = dateString + 'Z';
    }
    
    const utcDate = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(utcDate.getTime())) {
      console.warn("Invalid date string:", timestamp);
      return "Just now";
    }
    
    const localTime = toZonedTime(utcDate, userTimeZone);
    return formatDistanceToNow(localTime, { addSuffix: true });
  } catch (error) {
    console.error("Error formatting date:", error, "Date string:", timestamp);
    return "Just now";
  }
}

export function isValidDate(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
}