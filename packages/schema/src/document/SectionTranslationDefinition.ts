import type { Schema } from 'effect'
import type { DocumentContent } from '../schemas/document/DocumentContent.js'
import type { DocumentContentTranslationStrategy } from './DocumentContentTranslationStrategy.js'

export interface SectionTranslationDefinition {
  id: string

  translationInstruction?: string

  translations: ReadonlyArray<AnyDocumentContentTranslationStrategy>
}

type AnyDocumentContentSchema = Schema.Schema<{
  readonly type: DocumentContent['type']
}>

type AnyDocumentContentTranslationStrategy =
  DocumentContentTranslationStrategy<AnyDocumentContentSchema>
