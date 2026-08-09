import type { ProjectRelativePath } from '@gyomu/schema/typescript'

/**
 * Represents documented architectural facts about a specific directory within a project, including its responsibilities, relationships, and design decisions.
 */
export interface DirectoryFacts {
  /**
   * The path of the directory relative to the project root.
   */
  relativePath: ProjectRelativePath

  /**
   * A collection of primary roles or tasks assigned to this directory.
   */
  responsibilities: ReadonlyArray<string>

  /**
   * A collection of references describing how this directory interacts with or depends on other parts of the system.
   */
  relationships: ReadonlyArray<string>

  /**
   * A collection of rationale or architectural choices specific to this directory.
   */
  designDecisions: ReadonlyArray<string>
}
