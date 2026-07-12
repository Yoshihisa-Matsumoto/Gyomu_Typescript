import { join, relative, resolve } from 'node:path'
import { Effect } from 'effect'
import { expandDirectoryGlob, pathExists, readJsonFromFile } from '@gyomu/infra/fs'
import { FullPath } from '@gyomu/schema'
import { WorkspaceRelativePath } from '@gyomu/schema/typescript'
import { findWorkspaceRoot } from '../path/findWorkspaceRoot.js'
import { loadWorkspaceDefinition } from './loadWorkspaceDefinition.js'
import type { WorkspaceProject } from './WorkspaceProject.js'

export const listTypescriptProject = (startDirectory: FullPath = FullPath(process.cwd())) => {
  return Effect.gen(function* () {
    const repositoryRoot = yield* findWorkspaceRoot(startDirectory)
    const workspaceDefinition = yield* loadWorkspaceDefinition(startDirectory)

    const projects: Array<WorkspaceProject> = []

    for (const packageDefinition of workspaceDefinition.packages) {
      const directories = yield* expandDirectoryGlob(repositoryRoot, packageDefinition)
      console.dir(directories)
      for (const directory of directories) {
        const projectFolder = resolve(repositoryRoot, directory)
        const packageJson = FullPath(join(projectFolder, 'package.json'))
        const packageJsonExists = yield* pathExists(packageJson)
        if (!packageJsonExists) continue

        const pkg = yield* readJsonFromFile<PackageJson>(packageJson)
        const name = pkg.name
        if (!name) continue

        const tsConfigExists = yield* pathExists(FullPath(join(projectFolder, 'tsconfig.json')))

        const project: WorkspaceProject = {
          name,
          rootPath: WorkspaceRelativePath(relative(repositoryRoot, projectFolder)),
          hasTypescript: tsConfigExists,
        }
        projects.push(project)
      }
    }

    return {
      repositoryRoot: FullPath(repositoryRoot),
      projects: projects.sort((a, b) => a.rootPath.localeCompare(b.rootPath)),
    }
  })
}

interface PackageJson {
  name?: string
}
