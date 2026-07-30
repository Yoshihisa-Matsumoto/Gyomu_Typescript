import { SectionPromptMap } from './renderer/renderSectionInput.js'
import type { SupportedSectionId } from './renderer/renderSectionInput.js'
import type { SectionPromptProvider } from '../document/SectionPromptProvider.js'
import type { LlmContextBuildContext } from '@gyomu/schema/concept'
import type { FileSystem } from 'effect'

/**
 * Defines the identifier for readme section routes used in the AI model routing system.
 */

export const LlmContextPromptProvider: SectionPromptProvider<
  SupportedSectionId,
  LlmContextBuildContext,
  FileSystem.FileSystem
> = {
  render(sectionId, context) {
    return SectionPromptMap[sectionId](context)
  },
}
