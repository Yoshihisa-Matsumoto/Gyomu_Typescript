import { relative } from 'node:path'
import { Effect } from 'effect'
import { readDirectoryDetailed } from '@gyomu/infra/fs'
import { loadFileAnalysisResult } from '@gyomu/ts-analysis'
import { ProjectRelativePath } from '@gyomu/schema/typescript'
import type { AnalysisError, ProjectContext } from '@gyomu/ts-analysis'
import type { IOError } from '@gyomu/schema'
import type { BuildDirectoryOption, BuildResult } from '../types.js'
import type { FileSystem } from 'effect'
import type { DirectoryConcept } from '@gyomu/ai-compiler/directory-concept'
import type { FileAnalysis } from '../../../../ts-analysis/dist/analysis/file/FileAnalysis.js'

export const buildDirectoryConceptFromPath = (
  context: ProjectContext,
  targetDirectory: string,
  option?: BuildDirectoryOption,
): Effect.Effect<BuildResult, IOError | AnalysisError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const targetDirectoryRelativePath = relative(context.projectRoot, targetDirectory)

    const entries = yield* readDirectoryDetailed(targetDirectory)

    const folders = entries
      .filter((e) => e.isDirectory)
      .sort((a, b) => a.name.localeCompare(b.name))

    const files = entries.filter((e) => e.isFile).sort((a, b) => a.name.localeCompare(b.name))

    let isChanged = false

    const directoryConcepts: Array<{ path: string; concept: DirectoryConcept }> = []

    for (const folder of folders) {
      const result = yield* buildDirectoryConceptFromPath(context, folder.path, option)
      if (result.changed) isChanged = true
      directoryConcepts.push({ path: folder.path, concept: result.concept })
    }

    if (option?.changedFiles) {
      const isFolderChanged =
        option.changedFiles.filter((f) =>
          f.projectRelativePath.startsWith(targetDirectoryRelativePath),
        ).length > 0
      if (isFolderChanged) isChanged = true
    }

    const fileAnalysisList = new Array<FileAnalysis>()
    for (const file of files) {
      const fileFullPath = file.path
      const fileRelativePath = ProjectRelativePath(relative(context.projectRoot, fileFullPath))
      const result = yield* loadFileAnalysisResult(context, fileRelativePath)
      fileAnalysisList.push(result.result.analysis)
    }

    return {
      concept: {
        summary: '',
        responsibilities: [],
        concepts: [],
        relationships: [],
        designDecisions: [],
      },
      changed: isChanged,
    }
  })
