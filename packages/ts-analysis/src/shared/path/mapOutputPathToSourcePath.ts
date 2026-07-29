import { relative, resolve, sep } from 'node:path'
import { ProjectRelativePath } from '@gyomu/schema/typescript'
import { normalizePath } from './normalizePath.js'
import type { FullPath } from '@gyomu/schema'

/**
 * Configuration options for mapping build output paths to source file paths.
 */
export interface MapOutputPathToSourcePathOptions {
  /**
   * Source directory.
   *
   * Example:
   * src
   */
  rootDir: string

  /**
   * Build output directory.
   *
   * Example:
   * dist
   */
  outDir: string

  /**
   * package.json location directory
   */
  packageRootPath: FullPath
}

/**
 * Maps a build output file path to its corresponding source file path.
 *
 * @param outputPath The file path in the build output directory.
 *
 * @param options Configuration options for resolving paths.
 *
 * @returns The corresponding source file path as a ProjectRelativePath.
 *
 * @remarks
 * This function preserves the relative path from the output directory and
 * applies it to the source directory.
 *
 * Example:
 *
 * ```text
 * dist/config/index.js
 * ↓
 * src/config/index.ts
 * ```
 *
 * The output file must be located inside the configured outDir.
 *
 * Supported output extensions:
 *
 * ```text
 * .js
 * .mjs
 * .cjs
 * ```
 */
export const mapOutputPathToSourcePath = (
  outputPath: string,
  options: MapOutputPathToSourcePathOptions,
): ProjectRelativePath => {
  const packageRootPath = options.packageRootPath

  const rootDir = resolve(packageRootPath, options.rootDir)
  const outDir = resolve(packageRootPath, options.outDir)

  const outputFile = resolve(packageRootPath, outputPath)

  const relativePath = relative(outDir, outputFile)

  if (relativePath.startsWith(`..${sep}`) || relativePath === '..') {
    throw new Error(`${outputPath} is not inside outDir (${options.outDir})`)
  }

  return ProjectRelativePath(
    normalizePath(
      relative(packageRootPath, resolve(rootDir, relativePath).replace(/\.(c|m)?js$/, '.ts')),
    ),
  )
}
