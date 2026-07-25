import { Schema } from 'effect'
import { DocumentContent } from './DocumentContent.js'
import type { Builder } from '../../entity/type.js'

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
      'Section title. If omitted, the renderer may determine the title from the section id.',
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

export type Section = Builder<Schema.Schema.Type<typeof Section>>
