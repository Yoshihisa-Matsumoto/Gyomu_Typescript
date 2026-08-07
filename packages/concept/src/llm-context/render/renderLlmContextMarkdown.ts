import { LLM_CONTEXT_SECTION_TITLES } from '@gyomu/schema/concept'
import { renderMarkdown } from '../../document/renderer/renderMarkdown.js'
import type { ConceptOptions } from '../../ConceptOptions.js'
import type { TranslatedDocument } from '../../document/translation/TranslatedDocument.js'
import type { LlmContextBuildContext, LlmContextSectionId } from '@gyomu/schema/concept'

/**
 * Renders a README file content from the given build context and translation plan.
 *
 * @param context The build context containing metadata about the package.
 *
 * @param plan The translation plan defining the structure and language of the documentation.
 *
 * @param needLink Whether to include a link in the generated markdown. Defaults to false.
 *
 * @returns The rendered markdown content as a string.
 */
export const renderLlmContextMarkdown = (
  context: LlmContextBuildContext,
  plan: TranslatedDocument,
  option: ConceptOptions | undefined,
  needLink: boolean = false,
) => {
  return renderMarkdown({
    context,
    plan,
    getTitle: (context) => context.knowledge.package.displayName,
    getSectionTitle: (language, section) =>
      section.title ?? LLM_CONTEXT_SECTION_TITLES['en'][section.id as LlmContextSectionId],
    getLanguageLink: undefined,
  })
}
