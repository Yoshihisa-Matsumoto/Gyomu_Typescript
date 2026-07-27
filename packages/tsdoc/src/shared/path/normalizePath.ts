/**
 * Normalizes a given file path by replacing the .js extension with .ts.
 *
 * @param path The file path to normalize.
 *
 * @returns The normalized file path with a .ts extension.
 */
export const normalizePath = (path: string): string => path.replace(/\.js$/, '.ts')
