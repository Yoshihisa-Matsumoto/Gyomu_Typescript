import { ProjectRelativePath } from '@gyomu/schema/typescript'

/**
 * Maps a base path to a list of potential module specifier candidates by appending common file extensions and index patterns.
 *
 * @param basePath The base path of the module to resolve.
 *
 * @returns An array of candidate paths including .ts, .tsx, /index.ts, /index.tsx, and .d.ts variations.
 */
export const mapModuleSpecifierCandidates = (
  basePath: ProjectRelativePath,
): ReadonlyArray<ProjectRelativePath> => {
  return [
    ProjectRelativePath(`${basePath}.ts`),
    ProjectRelativePath(`${basePath}.tsx`),
    ProjectRelativePath(`${basePath}/index.ts`),
    ProjectRelativePath(`${basePath}/index.tsx`),
    ProjectRelativePath(`${basePath}.d.ts`),
  ]
}
