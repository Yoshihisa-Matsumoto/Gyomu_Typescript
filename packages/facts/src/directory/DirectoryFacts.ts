import type { ProjectRelativePath } from '@gyomu/schema/typescript'

export interface DirectoryFacts {
  relativePath: ProjectRelativePath
  responsibilities: ReadonlyArray<string>

  relationships: ReadonlyArray<string>

  designDecisions: ReadonlyArray<string>
}
