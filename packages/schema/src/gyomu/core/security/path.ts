import { isAbsolute, relative, resolve, win32 } from 'node:path'
import { GyomuError } from '../../../error/GyomuError.js'
import { fromSync } from '../../../effect/utility.js'
import type { Effect } from 'effect'

/**
 * Resolves a target path within a given base directory and ensures
 * that the resulting path does not escape the base boundary.
 *
 * This function acts as a security boundary primitive for filesystem-like
 * operations in agent execution environments.
 *
 * It guarantees that:
 *
 * - The resolved path is always within `basePath`
 * - Path traversal attempts (e.g. `..`, absolute paths) are rejected
 * - The returned path is a normalized relative path from `basePath`
 *
 * If the target path attempts to escape the base directory, a `GyomuError`
 * with `path.security` domain is thrown.
 *
 * Example:
 *
 * ```ts
 * resolvePathWithinBase('/repo', 'packages/app')
 * // => 'packages/app'
 *
 * resolvePathWithinBase('/repo', '../etc')
 * // throws GyomuError
 * ```
 *
 * @param basePath - The allowed root directory (security boundary root)
 * @param targetPath - The input path to resolve relative to the base
 * @returns A normalized relative path within the base directory
 * @throws GyomuError when the resolved path escapes the base boundary
 *
 * @remarks
 * This function is intended to be used as a foundational security primitive
 * for agent file-system operations, not as a general path utility.
 */
export const resolvePathWithinBase = (
  basePath: string,
  targetPath: string,
): Effect.Effect<string, GyomuError> =>
  fromSync(GyomuError, () => ({
    domain: 'path.security',
    operation: 'resolveWithinBase',
    reason: 'out_of_bounds' as const,
    message: 'targetPath escapes basePath',
  }))(() => {
    const isAbsolutePath = isAbsolute(targetPath) || win32.isAbsolute(targetPath)
    if (isAbsolutePath) {
      throw new GyomuError({
        cause: undefined,
        domain: 'path.security',
        operation: 'resolveWithinBase',
        reason: 'out_of_bounds' as const,
        message: 'targetPath need to be relative path',
      })
    }

    const baseResolved = resolve(basePath)
    const targetResolved = resolve(baseResolved, targetPath)

    const rel = relative(baseResolved, targetResolved) || '.'

    if (isAbsolute(rel) || rel.startsWith('..') || rel === '..') {
      throw new GyomuError({
        cause: undefined,
        domain: 'path.security',
        operation: 'resolveWithinBase',
        reason: 'out_of_bounds' as const,
        message: 'targetPath escapes basePath',
      })
    }

    return rel
  })
