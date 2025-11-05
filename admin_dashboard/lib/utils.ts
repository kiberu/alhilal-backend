import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely formats a date string or Date object
 * @param date - The date to format (string, Date, or null/undefined)
 * @param formatString - The format string for date-fns
 * @param fallback - The fallback string if date is invalid (default: "N/A")
 * @returns Formatted date string or fallback
 */
export function formatDate(
  date: string | Date | null | undefined,
  formatString: string = "MMM dd, yyyy",
  fallback: string = "N/A"
): string {
  if (!date) {
    return fallback
  }

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    if (isNaN(dateObj.getTime())) {
      return fallback
    }
    return format(dateObj, formatString)
  } catch (error) {
    return fallback
  }
}

