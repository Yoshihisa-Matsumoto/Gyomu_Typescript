import { Schema } from 'effect'
import { DocumentContent } from './DocumentContent.js'
import type { Builder } from '../../entity/type.js'

/**
 * A schema representing a logical section of a document, containing a stable identifier, an optional title, and content blocks.
 */
export const Section = Schema.Struct({
  /**
   * Stable section identifier.
   */
  id: Schema.String.annotate({
    description:
      'Stable identifier used by renderers and translators. It should not depend on the display language.',
    examples: ['overview', 'installation', 'architecture'],
  }),

  /**
   * Optional section title.
   */
  title: Schema.optional(Schema.String).annotate({
    description:
      'Optional section title. Omit this field entirely when no title is needed. Never use null. If omitted, the renderer may determine the title from the section id.',
  }),

  /**
   * Section contents.
   */
  contents: Schema.Array(DocumentContent).annotate({
    description: 'Content blocks contained in the section.',
  }),
}).annotate({
  description: 'A logical section of a document.',
})

/**
 * The inferred TypeScript type for the Section schema.
 */
export type Section = Builder<Schema.Schema.Type<typeof Section>>
