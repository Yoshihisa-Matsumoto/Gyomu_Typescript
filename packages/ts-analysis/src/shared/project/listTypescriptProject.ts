import { join, relative, resolve } from 'node:path'
import { Effect } from 'effect'
import { expandDirectoryGlob, pathExists } from '@gyomu/infra/fs'
import { FullPath } from '@gyomu/schema'
import { WorkspaceRelativePath } from '@gyomu/schema/typescript'
import { findWorkspaceRoot } from '../path/findWorkspaceRoot.js'
import { analyzePackageJson } from './analyzePackageJson.js'
import { analyzePnpmWorkspaceYaml } from './analyzePnpmWorkspaceYaml.js'
import type { WorkspaceProject } from './WorkspaceProject.js'

export const listTypescriptProject = (startDirectory: FullPath = FullPath(process.cwd())) => {
  return Effect.gen(function* () {
    const repositoryRoot = yield* findWorkspaceRoot(startDirectory)
    const pnpmWorkspacesAnalysis = yield* analyzePnpmWorkspaceYaml(repositoryRoot).pipe(
      Effect.catch((e) => {
        // logger.info(e, 'Error on analyzePnpmWorkspaceYaml')

        return Effect.succeed(undefined)
      }),
    )

    const projects: Array<WorkspaceProject> = []

    if (pnpmWorkspacesAnalysis) {
      for (const packageDefinition of pnpmWorkspacesAnalysis.packages) {
        const directories = yield* expandDirectoryGlob(repositoryRoot, packageDefinition)
        console.dir(directories)
        for (const directory of directories) {
          const projectFolder = resolve(repositoryRoot, directory)
          const packageJson = FullPath(join(projectFolder, 'package.json'))
          const packageJsonExists = yield* pathExists(packageJson)
          if (!packageJsonExists) continue

          const pkg = yield* analyzePackageJson(FullPath(projectFolder))
          const name = pkg.name
          if (!name) continue

          const tsConfigExists = yield* pathExists(FullPath(join(projectFolder, 'tsconfig.json')))

          const project: WorkspaceProject = {
            name,
            rootPath: WorkspaceRelativePath(relative(repositoryRoot, projectFolder)),
            hasTypescript: tsConfigExists,
            packageJson: pkg,
          }
          projects.push(project)
        }
      }

      const result: WorkspaceContext = {
        repositoryRoot: FullPath(repositoryRoot),
        projects: Object.freeze(projects.sort((a, b) => a.rootPath.localeCompare(b.rootPath))),
        catalog: pnpmWorkspacesAnalysis.catalog,
      } satisfies WorkspaceContext
      return result
    } else {
      const projectFolder = repositoryRoot

      const pkg = yield* analyzePackageJson(FullPath(projectFolder))
      const name = pkg.name

      const tsConfigExists = yield* pathExists(FullPath(join(projectFolder, 'tsconfig.json')))

      const project: WorkspaceProject = {
        name,
        rootPath: WorkspaceRelativePath(relative(repositoryRoot, projectFolder)),
        hasTypescript: tsConfigExists,
        packageJson: pkg,
      }
      projects.push(project)

      const result: WorkspaceContext = {
        repositoryRoot: FullPath(repositoryRoot),
        projects: Object.freeze(projects.sort((a, b) => a.rootPath.localeCompare(b.rootPath))),
        catalog: {},
      } satisfies WorkspaceContext
      return result
    }
  })
}

export type WorkspaceContext = {
  repositoryRoot: FullPath
  projects: ReadonlyArray<WorkspaceProject>
  catalog: Record<string, string>
}
