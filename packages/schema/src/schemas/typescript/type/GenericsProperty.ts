import { Schema } from 'effect'
import { TypeAnalysis } from './TypeAnalysis.js'

/**
 * Represents an generics property.
 */
export const GenericsProperty = Schema.Struct({
  name: Schema.String.annotate({
    description: 'The name of the property.',
  }),

  type: Schema.Union([Schema.suspend(() => TypeAnalysis), Schema.Undefined]).annotate({
    description: 'The type of the property.',
  }),
}).annotate({
  description: 'Common properties shared by all type properties.',
})

/**
 * TypeScript type representation for the generics property
 */
export type GenericsProperty = typeof GenericsProperty.Type
