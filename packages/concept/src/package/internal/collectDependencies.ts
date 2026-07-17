import type { DependencyKind, DependencySource, PackageDependency } from '@gyomu/schema/typescript'
import type { DependencyAnalysis } from '@gyomu/schema/concept'
import type { ProjectContext, WorkspaceContext } from '@gyomu/ts-analysis'

export const collectDependencies = (
  context: ProjectContext,
  workspace: WorkspaceContext,
): Array<DependencyAnalysis> => {
  const result: Array<DependencyAnalysis> = []

  result.push(
    ...analyzeDependencies('dependency', context.packageJson.dependencies, workspace),
    ...analyzeDependencies('devDependency', context.packageJson.devDependencies, workspace),
    ...analyzeDependencies(
      'optionalDependency',
      context.packageJson.optionalDependencies,
      workspace,
    ),
    ...analyzeDependencies('peerDependency', context.packageJson.peerDependencies, workspace),
  )

  return result
}

const analyzeDependencies = (
  source: DependencySource,
  dependencies: ReadonlyArray<PackageDependency>,
  workspace: WorkspaceContext,
): Array<DependencyAnalysis> => {
  return dependencies.map(
    (dependency) =>
      ({
        kind: dependency.kind,
        source,
        packageName: dependency.packageName,
        requestedVersion: dependency.specifier,
        resolvedVersion: resolveVersion(
          dependency.packageName,
          dependency.kind,
          dependency.specifier,
          workspace,
        ),
      }) satisfies DependencyAnalysis,
  )
}

const resolveVersion = (
  packageName: string,
  kind: DependencyKind,
  specifier: string,
  workspace: WorkspaceContext,
): string => {
  switch (kind) {
    case 'catalog': {
      // read pnpm-workspace.yaml
      const version = workspace.catalog[packageName] ?? ''
      return version
    }
    case 'workspace': {
      // read other package.json
      const targetPackage = workspace.projects.find((p) => p.name == packageName)
      if (!targetPackage) return ''
      return targetPackage.packageJson.version
    }

    default:
      return specifier
  }
}
