import { join } from 'node:path'
import { pathExists, readJsonFromFileAndValidate } from '@gyomu/infra/fs'
import { FullPath, wrapInfraError } from '@gyomu/schema'
import { DirectoryConcept } from '@gyomu/schema/schemas/concept/DirectoryConcept'
import { Effect } from 'effect'
import { ConceptError } from '../../error/ConceptError.js'
import type { ProjectRelativePath } from '@gyomu/schema/typescript'
import type { ProjectContext } from '@gyomu/ts-analysis'

export const loadDirectoryConcept = (
  context: ProjectContext,
  targetDirectory: ProjectRelativePath,
) =>
  Effect.gen(function* () {
    const directoryConceptPath = FullPath(
      join(context.projectRoot, '.gyomu', targetDirectory, '$Directory' + '.json'),
    )

    const fileExists = yield* pathExists(directoryConceptPath)
    if (!fileExists) return undefined
    return yield* readJsonFromFileAndValidate(
      'DirectoryConcept',
      DirectoryConcept,
      directoryConceptPath,
    )
  }).pipe(
    Effect.mapError((e) =>
      wrapInfraError(ConceptError, e, () => ({
        filePath: targetDirectory,
        message: 'Fail to load Directory Concept',
        phase: 'directory-summary' as const,
        context: context.projectRoot,
      })),
    ),
  )
