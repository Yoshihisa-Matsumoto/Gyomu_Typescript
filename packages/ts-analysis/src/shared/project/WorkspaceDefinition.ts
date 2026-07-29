/**
 * Defines the structure of a workspace, specifying the packages included and a catalog of version mappings.
 */
export interface WorkspaceDefinition {
  /**
   * The list of workspace package paths.
   */
  packages: ReadonlyArray<string>

  /**
   * A map of dependencies to their specific versions.
   */
  catalog: Record<string, string>
}
