/**
 * Format Utilities - Data formatting functions
 */

/**
 * Formats milliseconds to a human-readable string.
 * Shows seconds for values >= 1000ms, otherwise shows ms.
 * @param ms - Milliseconds value
 * @returns Formatted string like "1.2345 secs" or "123.45 ms"
 */
export function formatMs(ms: number): string {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(4)} secs`;
  }
  return `${ms.toFixed(2)} ms`;
}

/**
 * Truncates a string with ellipsis.
 * @param str - String to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated string with ellipsis if needed
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}
