export interface WorkspaceDefinition {
  packages: ReadonlyArray<string>
  catalog: Record<string, string>
}
