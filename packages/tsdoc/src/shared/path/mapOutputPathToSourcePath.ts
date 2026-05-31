import { relative, resolve, sep } from 'node:path'

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
   * Base directory used to resolve rootDir, outDir, and outputPath.
   *
   * Defaults to process.cwd().
   */
  cwd?: string
}

/**
 * Maps a build output file path to its corresponding source file path.
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
): string => {
  const cwd = options.cwd ?? process.cwd()

  const rootDir = resolve(cwd, options.rootDir)
  const outDir = resolve(cwd, options.outDir)

  const outputFile = resolve(cwd, outputPath)

  const relativePath = relative(outDir, outputFile)

  if (relativePath.startsWith(`..${sep}`) || relativePath === '..') {
    throw new Error(`${outputPath} is not inside outDir (${options.outDir})`)
  }

  return resolve(rootDir, relativePath).replace(/\.(c|m)?js$/, '.ts')
}
