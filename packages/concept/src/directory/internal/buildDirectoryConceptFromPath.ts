import { relative } from 'node:path'
import { Effect } from 'effect'
import { readDirectoryDetailed } from '@gyomu/infra/fs'
import { loadFileAnalysisResult } from '@gyomu/ts-analysis'
import { DirectoryRelativePath, ProjectRelativePath } from '@gyomu/schema/typescript'
import { logger, wrapInfraError } from '@gyomu/schema'
import { ConceptError } from '../../error/ConceptError.js'
import { buildFileSummaryRecord } from './buildFileSummaryRecord.js'
import { loadDirectoryConcept } from './loadDirectoryConcept.js'
import { generateDirectoryConcept } from './generateDirectoryConcept.js'
import { saveDirectoryConcept } from './saveDirectoryConcept.js'
import type { ConceptOptions } from '../../ConceptOptions.js'
import type { AiModelRoute, ModelRoutes } from '@gyomu/ai'
import type { FullPath } from '@gyomu/schema'
import type { DirectoryConceptInput, FileSummary } from '@gyomu/schema/concept'
import type { DirectoryConcept } from '@gyomu/schema/schemas/concept'
import type { ProjectContext } from '@gyomu/ts-analysis'
import type { BuildResult } from '../types.js'
import type { FileSystem } from 'effect'

export const buildDirectoryConceptFromPath = (
  context: ProjectContext,
  targetDirectory: FullPath,
  option?: ConceptOptions,
): Effect.Effect<BuildResult, ConceptError, FileSystem.FileSystem | AiModelRoute | ModelRoutes> =>
  Effect.gen(function* () {
    const targetDirectoryRelativePath = ProjectRelativePath(
      relative(context.projectRoot, targetDirectory),
    )

    const entries = yield* readDirectoryDetailed(targetDirectory)

    const folders = entries
      .filter((e) => e.isDirectory)
      .sort((a, b) => a.name.localeCompare(b.name))

    const files = entries.filter((e) => e.isFile).sort((a, b) => a.name.localeCompare(b.name))

    let isChanged = false

    if (option?.changedFiles) {
      const isFolderChanged =
        option.changedFiles.filter((f) =>
          f.projectRelativePath.startsWith(targetDirectoryRelativePath),
        ).length > 0
      if (isFolderChanged) isChanged = true
    }

    if (!isChanged) {
      const directoryConcept = yield* loadDirectoryConcept(
        context,
        targetDirectoryRelativePath,
        option,
      ).pipe(
        Effect.catch((e) => {
          logger.info(e, 'Error on loadDirectoryConcept')

          if (e.details) {
            logger.info(e.details, 'Schema Issue')
          }

          return Effect.succeed(undefined)
        }),
      )
      if (directoryConcept) return { concept: directoryConcept, changed: false }
    }

    const directoryConcepts: Array<{ path: DirectoryRelativePath; concept: DirectoryConcept }> = []

    for (const folder of folders) {
      const result = yield* buildDirectoryConceptFromPath(context, folder.path, option)
      if (result.changed) isChanged = true
      directoryConcepts.push({
        path: DirectoryRelativePath(relative(targetDirectory, folder.path)),
        concept: result.concept,
      })
    }

    const fileSummaryList = new Array<FileSummary>()
    for (const file of files) {
      const fileFullPath = file.path
      const fileRelativePath = ProjectRelativePath(relative(context.projectRoot, fileFullPath))
      const result = yield* loadFileAnalysisResult(context, fileRelativePath, option)
      fileSummaryList.push(buildFileSummaryRecord(result.result))
    }

    const input: DirectoryConceptInput = {
      files: fileSummaryList,
      subDirectories: directoryConcepts,
    }

    const concept = yield* generateDirectoryConcept(
      context.projectName,
      targetDirectoryRelativePath,
      input,
      option,
    )

    yield* saveDirectoryConcept(context, targetDirectoryRelativePath, concept)
    return {
      concept,
      changed: isChanged,
    }
  }).pipe(
    Effect.mapError((e) =>
      wrapInfraError(ConceptError, e, () => ({
        packageName: context.projectName,
        filePath: targetDirectory,
        message: 'Fail to generate Directory Concept',
        phase: 'directory-summary' as const,
        details: context.projectName,
      })),
    ),
  )
