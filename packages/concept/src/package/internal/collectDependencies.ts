import type { DependencyKind, DependencySource, PackageDependency } from '@gyomu/schema/typescript'
import type { DependencyAnalysis } from '@gyomu/schema/concept'
import type { ProjectContext, WorkspaceContext } from '@gyomu/ts-analysis'

/**
 * Collects and analyzes all dependency types defined in the project's package.json file.
 *
 * @param context The project context containing the parsed package.json information.
 *
 * @param workspace The workspace context for dependency resolution.
 *
 * @returns An array of dependency analysis records collected from all dependency sections.
 */
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
