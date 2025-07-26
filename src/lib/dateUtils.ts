import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

/**
 * Safely creates a Date object from a string, number, or Date
 * Returns null if the input is invalid
 */
export function safeDate(dateInput: string | number | Date | null | undefined): Date | null {
  if (!dateInput) return null
  
  try {
    const date = new Date(dateInput)
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return null
    }
    return date
  } catch {
    return null
  }
}

/**
 * Safely formats a date with fallback
 */
export function safeFormat(
  dateInput: string | number | Date | null | undefined,
  formatString: string,
  fallback: string = '无日期'
): string {
  const date = safeDate(dateInput)
  if (!date) return fallback
  
  try {
    return format(date, formatString, { locale: zhCN })
  } catch {
    return fallback
  }
}

/**
 * Safely formats a date for display in lists
 */
export function formatListDate(dateInput: string | number | Date | null | undefined): string {
  return safeFormat(dateInput, 'MM/dd HH:mm', '无记录')
}

/**
 * Safely formats a date for detailed display
 */
export function formatDetailDate(dateInput: string | number | Date | null | undefined): string {
  return safeFormat(dateInput, 'PPP', '无日期')
}

/**
 * Safely formats a date with time for detailed display
 */
export function formatDetailDateTime(dateInput: string | number | Date | null | undefined): string {
  return safeFormat(dateInput, 'PPP HH:mm', '无日期')
}

/**
 * Safely formats a date for form inputs
 */
export function formatFormDate(dateInput: string | number | Date | null | undefined): string {
  return safeFormat(dateInput, 'yyyy-MM-dd', '')
}

/**
 * Checks if a date string/object is valid
 */
export function isValidDate(dateInput: string | number | Date | null | undefined): boolean {
  return safeDate(dateInput) !== null
}