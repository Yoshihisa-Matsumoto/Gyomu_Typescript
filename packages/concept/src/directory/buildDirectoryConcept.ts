import { join } from 'node:path'
import { Effect } from 'effect'
import { FullPath } from '@gyomu/schema'
import { buildDirectoryConceptFromPath } from './internal/buildDirectoryConceptFromPath.js'
import type { ConceptOptions } from '../ConceptOptions.js'
import type { ProjectContext } from '@gyomu/ts-analysis'

/**
 * Builds a directory concept based on the project context and optional configuration.
 *
 * @param context The project context containing root information.
 *
 * @param option Optional settings for the directory concept, including the target folder.
 *
 * @returns An Effect containing the constructed directory concept.
 */
export const buildDirectoryConcept = (context: ProjectContext, option?: ConceptOptions) =>
  Effect.gen(function* () {
    const rootPath = option?.targetFolder
      ? FullPath(join(context.projectRoot, option.targetFolder))
      : FullPath(join(context.projectRoot, context.sourceRoot))

    return yield* buildDirectoryConceptFromPath(context, rootPath, option)
  })
