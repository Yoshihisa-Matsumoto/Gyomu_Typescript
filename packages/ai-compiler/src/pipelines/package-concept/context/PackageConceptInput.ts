import type { PackageInfoAnalysis } from '@gyomu/schema/concept'
import type { ProjectRelativePath } from '@gyomu/schema/typescript'

export interface PackageConceptInput {
  package: PackageInfoAnalysis

  topDirectories: Array<{
    path: ProjectRelativePath
    importance: string
    summary: string
    responsibilities: ReadonlyArray<string>
  }>

  publicApi: Array<{
    exportPath: string
    symbols: Array<{
      name: string
      summary: string
    }>
  }>

  dependencies: Array<{
    /**
     * The name of the dependency package.
     */
    packageName: string

    version: string
  }>
}
