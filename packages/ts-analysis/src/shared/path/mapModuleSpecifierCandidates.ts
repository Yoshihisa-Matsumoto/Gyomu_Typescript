import { ProjectRelativePath } from '@gyomu/schema/typescript'

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
