import { join, normalize, relative } from 'node:path'
import { Effect } from 'effect'
import { FullPath } from '@gyomu/schema'
import { Project } from 'ts-morph'
import { ProjectRelativePath } from '@gyomu/schema/typescript'
import { normalizePath } from '../shared/index.js'
import { analyzePackageJson } from '../shared/project/analyzePackageJson.js'
import type { AnalysisError } from './error/AnalysisError.js'
import type { WorkspaceRelativePath } from '@gyomu/schema/typescript'
import type { FileSystem } from 'effect'
import type { ProjectContext } from './project/ProjectContext.js'

/**
 * Initializes the project context by loading the package.json and TypeScript configuration for the given workspace path.
 *
 * @param args Configuration object containing the repository root path and the project's relative path.
 *
 * @returns An Effect that yields a ProjectContext on success, or an AnalysisError if initialization fails. Requires a FileSystem service.
 */
export const initializeProjectContext = (args: {
  repoRoot: FullPath
  projectRelativePath: WorkspaceRelativePath
}): Effect.Effect<ProjectContext, AnalysisError, FileSystem.FileSystem> => {
  const projectRootAbsolutePath = FullPath(join(args.repoRoot, args.projectRelativePath))
  const tsConfig = join(projectRootAbsolutePath, 'tsconfig.json')

  return Effect.gen(function* () {
    const packageJson = yield* analyzePackageJson(projectRootAbsolutePath)

    const project = new Project({
      tsConfigFilePath: tsConfig,
    })
    let sourceDir = project.getCompilerOptions().rootDir ?? '.'
    if (normalizePath(sourceDir).startsWith(normalizePath(projectRootAbsolutePath)))
      sourceDir = relative(projectRootAbsolutePath, sourceDir)
    return {
      project,
      projectName: packageJson.name,
      projectRoot: FullPath(projectRootAbsolutePath),
      packageJson,
      sourceRoot: ProjectRelativePath(sourceDir),
      includedFiles: new Set(
        project
          .getSourceFiles()
          .map((file) => normalize(file.getFilePath()))
          .filter((filePath) => filePath.startsWith(projectRootAbsolutePath))
          .map((fileAbsolutePath) =>
            normalizePath(relative(projectRootAbsolutePath, fileAbsolutePath)),
          ),
      ),
    }
  })
}
