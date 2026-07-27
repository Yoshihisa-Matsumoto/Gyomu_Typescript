import { Schema } from 'effect'
import { TypeAnalysis } from '../type/TypeAnalysis.js'

export interface BindingElementAnalysis {
  propertyName?: string | undefined
  localName?: string | undefined

  nestedPattern?: BindingPatternAnalysis | undefined

  defaultValue?: TypeAnalysis | undefined
}

/**
 * A single element within a binding pattern.
 */
export const BindingElementAnalysis: Schema.Schema<BindingElementAnalysis> = Schema.Struct({
  propertyName: Schema.optional(Schema.String).annotate({
    description:
      'The original property name when destructuring an object. Undefined for array elements.',
  }),

  localName: Schema.optional(
    Schema.String.annotate({
      description: 'The local variable name introduced by this binding element.',
    }),
  ),

  defaultValue: Schema.Union([Schema.suspend(() => TypeAnalysis), Schema.Undefined]).annotate({
    description: 'The type of the default value.',
  }),
  nestedPattern: Schema.optional(
    Schema.suspend(() => BindingPatternAnalysis).annotate({
      description:
        'A nested binding pattern when this element destructures another object or array.',
    }),
  ),
})

export interface BindingPatternAnalysis {
  pattern: 'object' | 'array'

  elements: ReadonlyArray<BindingElementAnalysis>
}

/**
 * Describes how a value is destructured into local variables.
 */
export const BindingPatternAnalysis: Schema.Schema<BindingPatternAnalysis> = Schema.Struct({
  pattern: Schema.Literals(['object', 'array']).annotate({
    description: 'The kind of binding pattern used for destructuring.',
  }),

  elements: Schema.Array(BindingElementAnalysis).annotate({
    description: 'The elements contained in this binding pattern.',
  }),
})
