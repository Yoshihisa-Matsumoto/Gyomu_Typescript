import { relative } from 'node:path'
import { fromSync } from '@gyomu/schema/effect'
import { ProjectRelativePath } from '@gyomu/schema/typescript'
import { AnalysisError } from '../error/AnalysisError.js'
import type { FullPath } from '@gyomu/schema'
import type { SourceFileContext } from '../file/SourceFileContext.js'
import type { ProjectContext } from '../project/ProjectContext.js'

/**
 * Loads a source file into the analysis context.
 *
 * @param context The current project analysis context.
 *
 * @param sourceFullPath The absolute path to the source file to load.
 *
 * @returns An Effect containing the loaded SourceFileContext or an AnalysisError.
 */
export const loadSourceFile = (context: ProjectContext, sourceFullPath: FullPath) =>
  fromSync(AnalysisError, () => ({
    filePath: sourceFullPath,
    message: 'fail to load source',
    phase: 'source-file-load' as const,
  }))(() => {
    // console.log(sourceFullPath)
    const sourceFile = context.project.getSourceFile(sourceFullPath)

    if (!sourceFile) {
      throw new AnalysisError({
        cause: undefined,
        filePath: sourceFullPath,
        message: 'source not found',
        phase: 'source-file-load',
      })
    }
    const sourceRelativePath = ProjectRelativePath(relative(context.projectRoot, sourceFullPath))
    return { path: sourceRelativePath, sourceFile } satisfies SourceFileContext
  })
