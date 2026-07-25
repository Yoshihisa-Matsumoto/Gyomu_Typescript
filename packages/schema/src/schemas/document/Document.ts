import { Schema } from 'effect'
import { Section } from './Section.js'

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

export type Document = Schema.Schema.Type<typeof Document>
