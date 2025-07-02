import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely formats a date string with error handling
 * @param dateString - The date string to format (ISO format expected)
 * @param fallback - Fallback text if date is invalid
 * @returns Formatted date string or fallback
 */
export function formatDate(dateString: string | null | undefined, fallback: string = 'Unknown'): string {
  if (!dateString) {
    return fallback;
  }

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return fallback;
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error, 'dateString:', dateString);
    return fallback;
  }
}

/**
 * Safely formats a time string with error handling
 * @param dateString - The date string to format (ISO format expected)
 * @param fallback - Fallback text if date is invalid
 * @returns Formatted time string or fallback
 */
export function formatTime(dateString: string | null | undefined, fallback: string = ''): string {
  if (!dateString) {
    return fallback;
  }

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      console.warn('Invalid date string for time formatting:', dateString);
      return fallback;
    }

    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting time:', error, 'dateString:', dateString);
    return fallback;
  }
}

/**
 * Formats a date as relative time (e.g., "2 hours ago", "Yesterday")
 * @param dateString - The date string to format (ISO format expected)
 * @param fallback - Fallback text if date is invalid
 * @returns Relative time string or fallback
 */
export function formatRelativeTime(dateString: string | null | undefined, fallback: string = 'Unknown'): string {
  if (!dateString) {
    return fallback;
  }

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      console.warn('Invalid date string for relative time formatting:', dateString);
      return fallback;
    }

    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return formatDate(dateString, fallback);
    }
  } catch (error) {
    console.error('Error formatting relative time:', error, 'dateString:', dateString);
    return fallback;
  }
}

/**
 * Formats a date and time together
 * @param dateString - The date string to format (ISO format expected)
 * @param fallback - Fallback text if date is invalid
 * @returns Formatted date and time string or fallback
 */
export function formatDateTime(dateString: string | null | undefined, fallback: string = 'Unknown'): string {
  if (!dateString) {
    return fallback;
  }

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      console.warn('Invalid date string for datetime formatting:', dateString);
      return fallback;
    }

    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting datetime:', error, 'dateString:', dateString);
    return fallback;
  }
}
