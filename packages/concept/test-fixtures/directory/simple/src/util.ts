/**
 * Converts the first character of a string to uppercase.
 *
 * @param value Input string.
 * @returns String with the first character capitalized.
 */
export const capitalize = (value: string): string => {
  if (value.length === 0) {
    return value
  }

  return value.charAt(0).toUpperCase() + value.slice(1)
}

/**
 * Removes leading and trailing whitespace and converts consecutive spaces
 * into a single space.
 *
 * @param value Input string.
 * @returns Normalized string.
 */
export const normalizeWhitespace = (value: string): string => {
  return value.trim().replace(/\s+/g, ' ')
}
