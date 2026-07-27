/**
 * Normalizes a given file path by converting backslashes to forward slashes and stripping drive letter prefixes.
 *
 * @param p The path to normalize.
 *
 * @returns The normalized path as a string.
 */
export const normalizePath = (p: string) => p.replace(/\\/g, '/').replace(/^[a-zA-Z]:/, '')
