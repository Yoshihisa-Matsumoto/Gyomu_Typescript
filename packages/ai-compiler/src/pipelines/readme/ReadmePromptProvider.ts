import { SectionPromptMap } from './renderer/renderSectionInput.js'
import type { SectionPromptProvider } from '../document/SectionPromptProvider.js'
import type { SupportedSectionId } from './renderer/renderSectionInput.js'
import type { ReadmeBuildContext } from '@gyomu/schema/concept'
import type { FileSystem } from 'effect'

export const ReadmePromptProvider: SectionPromptProvider<
  SupportedSectionId,
  ReadmeBuildContext,
  FileSystem.FileSystem
> = {
  render(sectionId, context) {
    return SectionPromptMap[sectionId](context)
  },
}
