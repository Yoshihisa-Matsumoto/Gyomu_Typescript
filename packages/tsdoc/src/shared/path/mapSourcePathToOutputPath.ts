import { relative, resolve, sep } from 'node:path'

/**
 * Configuration options for mapping a source path to an output path.
 */
export interface MapSourcePathToOutputPathOptions {
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
   * Base directory used to resolve rootDir, outDir, and sourcePath.
   *
   * Defaults to process.cwd().
   */
  cwd?: string
}

/**
 * Maps a source file path to its corresponding build output path.
 *
 * @param sourcePath The absolute or relative path to the source file.
 *
 * @param options The configuration options.
 *
 * @returns The computed output file path.
 *
 * @remarks
 * This function preserves the relative path from the source directory and
 * applies it to the output directory.
 *
 * Example:
 *
 * ```text
 * src/config/index.ts
 * ↓
 * dist/config/index.js
 * ```
 *
 * The source file must be located inside the configured rootDir.
 */
export const mapSourcePathToOutputPath = (
  sourcePath: string,
  options: MapSourcePathToOutputPathOptions,
): string => {
  const cwd = options.cwd ?? process.cwd()

  const rootDir = resolve(cwd, options.rootDir)
  const outDir = resolve(cwd, options.outDir)

  const sourceFile = resolve(cwd, sourcePath)

  const relativePath = relative(rootDir, sourceFile)

  if (relativePath.startsWith(`..${sep}`) || relativePath === '..') {
    throw new Error(`${sourcePath} is not inside rootDir (${options.rootDir})`)
  }

  return resolve(outDir, relativePath).replace(/\.tsx?$/, '.js')
}
