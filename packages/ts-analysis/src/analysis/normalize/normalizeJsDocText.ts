/**
 * Normalizes a raw JSDoc string by removing leading asterisk prefixes and line-ending artifacts.
 *
 * @param value The raw JSDoc block string to normalize.
 *
 * @returns The normalized, cleaned JSDoc content.
 */
export const normalizeJsDocText = (value: string): string => {
  return value
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) =>
      line
        .replace(/^\s*\/\*\*\s?$/, '')
        .replace(/^\s*\*\/\s?$/, '')
        .replace(/^\s*\*\s?/, ''),
    )
    .join('\n')
    .trim()
}
