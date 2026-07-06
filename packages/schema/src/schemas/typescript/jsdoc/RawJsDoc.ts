import { Schema } from 'effect'
import { LineRange } from '../LineRange.js'

/**
 * Represents a raw JSDoc/TSDoc comment block containing the raw string content and its source file location.
 */
export const RawJsDoc = Schema.Struct({
  rawText: Schema.String.annotate({
    description: 'The raw string content of the JSDoc comment.',
  }),

  location: LineRange.annotate({
    description: 'The source file location coordinates of the comment block.',
  }),
}).annotate({
  description:
    'Represents a raw JSDoc/TSDoc comment block with its source text and location information.',
})

/**
 * The inferred TypeScript type for the RawJsDoc schema.
 */
export type RawJsDoc = Schema.Schema.Type<typeof RawJsDoc>
