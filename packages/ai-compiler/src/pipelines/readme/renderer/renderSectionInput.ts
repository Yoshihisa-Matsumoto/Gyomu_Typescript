import { buildDevelopmentMessages } from './buildDevelopmentMessages.js'
import { buildDependenciesMessages } from './buildDependenciesMessages.js'
import { buildOverviewMessages } from './buildOverviewMessages.js'
import { buildArchitectureMessages } from './buildArchitectureMessages.js'
import type { Effect, FileSystem } from 'effect'
import type { Message } from '@gyomu/schema/conversation'
import type { ReadmeBuildContext, ReadmeSectionId } from '@gyomu/schema/concept'

import type { IOError } from '@gyomu/schema'

export type SupportedSectionId = Extract<
  ReadmeSectionId,
  'development' | 'dependencies' | 'overview' | 'architecture'
>
export const SectionPromptMap: Record<
  SupportedSectionId,
  (context: ReadmeBuildContext) => Effect.Effect<Array<Message>, IOError, FileSystem.FileSystem>
> = {
  development: buildDevelopmentMessages,
  dependencies: buildDependenciesMessages,
  overview: buildOverviewMessages,
  architecture: buildArchitectureMessages,
}
