import { buildDevelopmentMessages } from './buildDevelopmentMessages.js'
import { buildDependenciesMessages } from './buildDependenciesMessages.js'
import { buildOverviewMessages } from './buildOverviewMessages.js'
import { buildArchitectureMessages } from './buildArchitectureMessages.js'
import type { Effect, FileSystem } from 'effect'
import type { Message } from '@gyomu/schema/conversation'
import type { ReadmeBuildContext, ReadmeSectionId } from '@gyomu/schema/concept'

import type { IOError } from '@gyomu/schema'

/**
 * Defines the subset of supported Readme section identifiers, including 'development', 'dependencies', 'overview', and 'architecture'.
 */
export type SupportedSectionId = Extract<
  ReadmeSectionId,
  'development' | 'dependencies' | 'overview' | 'architecture'
>

/**
 * A mapping of supported section identifiers to functions that generate the corresponding prompt messages. Each function requires ReadmeBuildContext and performs file system operations.
 */
export const SectionPromptMap: Record<
  SupportedSectionId,
  (context: ReadmeBuildContext) => Effect.Effect<Array<Message>, IOError, FileSystem.FileSystem>
> = {
  development: buildDevelopmentMessages,
  dependencies: buildDependenciesMessages,
  overview: buildOverviewMessages,
  architecture: buildArchitectureMessages,
}
