import { README_LINK, README_SECTION_TITLES } from '@gyomu/schema/concept'
import { getReadmeFileName } from '../internal/getReadmeFileName.js'
import { renderMarkdown } from '../../document/renderer/renderMarkdown.js'
import type { ConceptOptions } from '../../ConceptOptions.js'
import type { TranslatedDocument } from '../../document/translation/TranslatedDocument.js'
import type { ReadmeBuildContext, ReadmeSectionId } from '@gyomu/schema/concept'

/**
 * Renders a README file content from the given build context and translation plan.
 *
 * @param context The build context containing metadata about the package.
 *
 * @param plan The translation plan defining the structure and language of the documentation.
 *
 * @param option Optional configuration for the documentation rendering.
 *
 * @param needLink Whether to include a link in the generated markdown. Defaults to false.
 *
 * @returns The rendered markdown content as a string.
 */
export const renderReadmeMarkdown = (
  context: ReadmeBuildContext,
  plan: TranslatedDocument,
  option: ConceptOptions | undefined,
  needLink: boolean = false,
) => {
  return renderMarkdown({
    context,
    plan,
    getTitle: (context) => context.knowledge.package.displayName,
    getSectionTitle: (language, section) =>
      section.title ?? README_SECTION_TITLES[language][section.id as ReadmeSectionId],
    getLanguageLink: needLink
      ? (language, plan) => {
          if (language == plan.language) {
            return README_LINK[language]
          }
          return `[${README_LINK[language]}](${getReadmeFileName(language)})`
        }
      : undefined,
  })
}
