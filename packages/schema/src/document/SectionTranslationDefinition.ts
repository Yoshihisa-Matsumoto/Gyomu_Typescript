import type { Schema } from 'effect'
import type { DocumentContent } from '../schemas/document/DocumentContent.js'
import type { DocumentContentTranslationStrategy } from './DocumentContentTranslationStrategy.js'
import type { Section } from '../schemas/document/Section.js'

export interface SectionTranslationDefinition {
  translationInstruction?: string | undefined

  translations: ReadonlyArray<AnyDocumentContentTranslationStrategy>
}

export interface SectionWithInstruction {
  section: Section
  translationInstruction?: string | undefined
}
export interface BuiltSection {
  section: Section

  translation: SectionTranslationDefinition
}

type AnyDocumentContentSchema = Schema.Schema<{
  readonly type: DocumentContent['type']
}>

type AnyDocumentContentTranslationStrategy =
  DocumentContentTranslationStrategy<AnyDocumentContentSchema>
