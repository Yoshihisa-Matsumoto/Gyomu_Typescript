import { join } from 'node:path'
import { Effect } from 'effect'
import { FullPath } from '@gyomu/schema'
import { buildDirectoryConceptFromPath } from './internal/buildDirectoryConceptFromPath.js'
import type { ConceptOptions } from '../ConceptOptions.js'
import type { ProjectContext } from '@gyomu/ts-analysis'

export const buildDirectoryConcept = (context: ProjectContext, option?: ConceptOptions) =>
  Effect.gen(function* () {
    const rootPath = option?.targetFolder
      ? FullPath(join(context.projectRoot, option.targetFolder))
      : FullPath(join(context.projectRoot, context.sourceRoot))

    return yield* buildDirectoryConceptFromPath(context, rootPath, option)
  })
