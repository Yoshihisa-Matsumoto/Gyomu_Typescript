import { executeDocumentContentTranslation } from '@gyomu/ai-compiler/translation'
import { Effect } from 'effect'
import type { ConceptOptions } from '../../ConceptOptions.js'
import type { BuiltSection } from '@gyomu/schema/document'
import type { LanguageCodes, Section } from '@gyomu/schema/schemas/document'

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
