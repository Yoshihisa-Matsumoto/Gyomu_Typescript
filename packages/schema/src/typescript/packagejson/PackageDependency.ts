export interface PackageDependency {
  /**
   * package名
   */
  readonly packageName: string

  /**
   * package.jsonの書かれた値
   */
  readonly specifier: string

  /**
   * specifierの種類
   */
  readonly kind: DependencyKind
}

export const SupportedDependencyKind = [
  'version',
  'workspace',
  'catalog',
  'file',
  'link',
  'git',
  'url',
  'unknown',
] as const

export type DependencyKind = (typeof SupportedDependencyKind)[number]

export const getSupportedDependencyKind = (value: string): DependencyKind => {
  for (const kind of SupportedDependencyKind) {
    if (value == kind) return kind
    if (value.startsWith(kind)) return kind
  }
  return 'unknown'
}

export type DependencySource =
  'dependency' | 'devDependency' | 'peerDependency' | 'optionalDependency'
