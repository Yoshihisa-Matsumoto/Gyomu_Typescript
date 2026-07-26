import { Schema } from 'effect'
import { Section } from './Section.js'

/**
 * Represents a structured document, defining its title and a collection of sections, independent of any specific output format.
 */
export const Document = Schema.Struct({
  /**
   * Document title.
   */
  title: Schema.String.annotate({
    description: 'Top-level document title.',
    examples: ['@gyomu/schema'],
  }),

  /**
   * Top-level document sections.
   */
  sections: Schema.Array(Section).annotate({
    description: 'Sections contained in the document.',
  }),
}).annotate({
  description: 'A structured document independent of any output format such as Markdown or HTML.',
})

/**
 * The inferred static type of the Document schema.
 */
export type Document = Schema.Schema.Type<typeof Document>
