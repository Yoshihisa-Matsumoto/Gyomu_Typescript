import { capitalize, normalizeWhitespace } from './util.js'

/**
 * Formats a user's display name.
 *
 * The input string is normalized before its first character is capitalized.
 *
 * @param name Raw user name.
 * @returns Formatted display name.
 */
export const formatDisplayName = (name: string): string => {
  return capitalize(normalizeWhitespace(name))
}
