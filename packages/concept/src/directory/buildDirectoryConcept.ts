import { join } from 'node:path'
import { Effect } from 'effect'
import { FullPath } from '@gyomu/schema'
import { buildDirectoryConceptFromPath } from './internal/buildDirectoryConceptFromPath.js'
import type { ProjectContext } from '@gyomu/ts-analysis'
import type { BuildDirectoryOption } from './types.js'

export const buildDirectoryConcept = (context: ProjectContext, option?: BuildDirectoryOption) =>
  Effect.gen(function* () {
    const rootPath = option?.targetFolder
      ? FullPath(join(context.projectRoot, option.targetFolder))
      : context.projectRoot
    return yield* buildDirectoryConceptFromPath(context, rootPath, option)
  })
