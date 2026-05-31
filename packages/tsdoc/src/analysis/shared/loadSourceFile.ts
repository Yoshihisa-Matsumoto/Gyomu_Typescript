import { fromSync } from '@gyomu/schema/effect'
import { AnalysisError } from '../error/AnalysisError.js'
import type { Project } from 'ts-morph'
import type { ProjectRelativePath } from '../types.js'
import type { SourceFileContext } from '../file/SourceFileContext.js'

export const loadSourceFile = (project: Project, sourceFilePath: ProjectRelativePath) =>
  fromSync(AnalysisError, () => ({
    filePath: sourceFilePath,
    message: 'fail to load source',
    phase: 'source-file-load' as const,
  }))(() => {
    const sourceFile = project.getSourceFile(sourceFilePath)

    if (!sourceFile) {
      throw new AnalysisError({
        cause: undefined,
        filePath: sourceFilePath,
        message: 'source not found',
        phase: 'source-file-load',
      })
    }
    return { path: sourceFilePath, sourceFile } satisfies SourceFileContext
  })
