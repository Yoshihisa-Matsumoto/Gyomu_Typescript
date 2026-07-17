export interface PackageImportEntry {
  readonly importPath: string
  readonly rawTarget: string | Readonly<Record<string, string>>
  readonly sourceTarget?: string
}
