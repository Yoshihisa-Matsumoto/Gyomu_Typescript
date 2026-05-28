import { relative, resolve, sep } from 'node:path'

export const resolveSourceEntry = (
  exportPath: string,
  options: {
    rootDir: string
    outDir: string
    cwd?: string
  },
): string => {
  const cwd = options.cwd ?? process.cwd()

  const rootDir = resolve(cwd, options.rootDir)
  const outDir = resolve(cwd, options.outDir)

  const exportFile = resolve(cwd, exportPath)

  const relativeFromOutDir = relative(outDir, exportFile)

  if (relativeFromOutDir.startsWith('..' + sep) || relativeFromOutDir === '..') {
    throw new Error(`${exportPath} is not inside outDir (${options.outDir})`)
  }

  return resolve(rootDir, relativeFromOutDir).replace(/\.(c|m)?js$/, '.ts')
}
