import type { FsPath } from './types.js'

/**
 * Joins multiple path segments into a single, normalized entry path string.
 *
 * @param parts An array of path segments to join.
 *
 * @returns The normalized joined entry path string.
 */
export const joinEntryPath = (...parts: Array<FsPath>): string =>
  parts.join('/').replace(/\/+/g, '/')

/**
 * Converts a file system path string to a normalized entry path by replacing backslashes with forward slashes.
 *
 * @param p The input file system path.
 *
 * @returns The converted entry path string.
 */
export const toEntryPath = (p: FsPath): string => p.replace(/\\/g, '/')
