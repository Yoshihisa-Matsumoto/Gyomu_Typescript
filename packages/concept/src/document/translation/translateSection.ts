import { executeDocumentContentTranslation } from '@gyomu/ai-compiler/translation'
import { Effect } from 'effect'
import type { ConceptOptions } from '../../ConceptOptions.js'
import type { BuiltSection } from '@gyomu/schema/document'
import type { LanguageCodes, Section } from '@gyomu/schema/schemas/document'

/**
 * Translates the contents of a section based on the specified translation strategy and target language.
 *
 * @param section The section to be translated, including its definition and current content.
 *
 * @param language The target language code for translation.
 *
 * @param option Optional configuration for the translation process, including retry logic.
 *
 * @returns Returns an Effect that resolves to the translated Section.
 */
export const translateSection = (
  section: BuiltSection,
  language: LanguageCodes,
  option?: ConceptOptions,
) =>
  Effect.gen(function* () {
    const contents = yield* Effect.forEach(section.section.contents, (content, index) =>
      Effect.gen(function* () {
        if (section.translation.strategy !== 'translate') {
          return content
        }
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const contentStrategy = section.translation.translations[index]!
        return yield* executeDocumentContentTranslation({
          language,
          sectionId: section.section.id,
          context: content,
          sectionDefinition: section.translation,
          contentStrategy: contentStrategy,
          retryOption: option?.retryOption,
        })
      }),
    )
    return {
      ...section.section,
      contents: contents,
    } satisfies Section
  })
