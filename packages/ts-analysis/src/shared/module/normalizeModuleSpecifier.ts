/**
 * Normalizes a module specifier to its source TypeScript file path.
 *
 * @example
 * './User.js'  -> './User.ts'
 * './User.mjs' -> './User.ts'
 * './User.cjs' -> './User.ts'
 */
export const normalizeModuleSpecifier = (moduleSpecifier: string): string => {
  return moduleSpecifier.replace(/\.(c|m)?js$/, '.ts')
}
