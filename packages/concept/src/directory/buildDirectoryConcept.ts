import { join } from 'node:path'
import { Effect } from 'effect'
import type { ProjectContext } from '@gyomu/ts-analysis'
import type { BuildDirectoryOption } from './types.js'

export const buildDirectoryConcept = (context: ProjectContext, option?: BuildDirectoryOption) =>
  Effect.gen(function* () {
    const rootPath = option?.targetFolder
      ? join(context.projectRoot, option.targetFolder)
      : context.projectRoot
  })
