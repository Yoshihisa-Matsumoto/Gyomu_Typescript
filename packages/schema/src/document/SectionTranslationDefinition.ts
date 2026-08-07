import type { Schema } from 'effect'
import type { DocumentContent } from '../schemas/document/DocumentContent.js'
import type { DocumentContentTranslationStrategy } from './DocumentContentTranslationStrategy.js'
import type { Section } from '../schemas/document/Section.js'

/**
 * Defines the translation strategy for a section, specifying whether to ignore it or apply a translation using provided instructions and strategies.
 */
export type SectionTranslationDefinition =
  | {
      strategy: 'none'
    }
  | {
      strategy: 'translate'
      translationInstruction?: string | undefined
      translations: ReadonlyArray<AnyDocumentContentTranslationStrategy>
    }

/**
 * Represents a section paired with an optional translation instruction.
 */
export interface SectionWithInstruction {
  /**
   * The document section to be processed.
   */
  section: Section

  /**
   * Optional instructions provided to guide the translation process.
   */
  translationInstruction?: string | undefined
}

/**
 * Represents a fully constructed section object that includes its content and defined translation configuration.
 */
export interface BuiltSection {
  /**
   * The base document section.
   */
  section: Section

  /**
   * The translation definition applied to this section.
   */
  translation: SectionTranslationDefinition
}

type AnyDocumentContentSchema = Schema.Schema<{
  readonly type: DocumentContent['type']
}>

type AnyDocumentContentTranslationStrategy =
  DocumentContentTranslationStrategy<AnyDocumentContentSchema>
