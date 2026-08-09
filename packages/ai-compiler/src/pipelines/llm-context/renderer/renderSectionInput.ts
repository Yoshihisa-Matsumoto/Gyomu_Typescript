import { buildOverviewMessages } from './buildOverviewMessages.js'
import { buildArchitectureMessages } from './buildArchitectureMessages.js'
import { buildDesignPrinciplesMessages } from './buildDesignPrinciplesMessages.js'
import { buildImportantConstraintsMessages } from './buildImportantConstraintsMessages.js'
import { buildEditingRuleMessages } from './buildEditingRuleMessages.js'
import type { Effect, FileSystem } from 'effect'
import type { Message } from '@gyomu/schema/conversation'
import type { LlmContextBuildContext, LlmContextSectionId } from '@gyomu/schema/concept'

import type { IOError } from '@gyomu/schema'

/**
 * Defines the subset of supported Readme section identifiers, including 'overview', 'architecture', 'design-principles', 'important-constraints', and 'editing-rules'.
 */
export type SupportedSectionId = Extract<
  LlmContextSectionId,
  'overview' | 'architecture' | 'design-principles' | 'important-constraints' | 'editing-rules'
>

/**
 * A mapping of supported section identifiers to functions that generate the corresponding prompt messages. Each function requires ReadmeBuildContext and performs file system operations.
 */
export const SectionPromptMap: Record<
  SupportedSectionId,
  (context: LlmContextBuildContext) => Effect.Effect<Array<Message>, IOError, FileSystem.FileSystem>
> = {
  overview: buildOverviewMessages,
  architecture: buildArchitectureMessages,
  'design-principles': buildDesignPrinciplesMessages,
  'important-constraints': buildImportantConstraintsMessages,
  'editing-rules': buildEditingRuleMessages,
}
