import { Schema } from 'effect'
import { TypeAnalysis } from '../type/TypeAnalysis.js'
import { IdentifierExpressionAnalysis } from '../expression/Identifier.js'

/**
 * A single element within a binding pattern.
 */
export interface BindingElementAnalysis {
  /**
   * The original property name when destructuring an object. Undefined for array elements.
   */
  propertyName?: string | undefined

  /**
   * The local variable name introduced by this binding element.
   */
  localName?: string | undefined

  /**
   * A nested binding pattern when this element destructures another object or array.
   */
  nestedPattern?: BindingPatternAnalysis | IdentifierExpressionAnalysis | undefined

  /**
   * The type of the default value.
   */
  defaultValue?: TypeAnalysis | undefined
}

/**
 * Represents a single element within a binding pattern, defining property mapping, variable naming, default values, and potential nested patterns.
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

  defaultValue: Schema.optional(
    Schema.Union([Schema.suspend(() => TypeAnalysis), Schema.Undefined]),
  ).annotate({
    description: 'The type of the default value.',
  }),
  nestedPattern: Schema.optional(
    Schema.Union([
      Schema.suspend(() => BindingPatternAnalysis),
      Schema.suspend(() => IdentifierExpressionAnalysis),
    ]).annotate({
      description:
        'A nested binding pattern when this element destructures another object or array.',
    }),
  ),
})

/**
 * Describes how a value is destructured into local variables.
 */
export interface BindingPatternAnalysis {
  /**
   * The literal discriminant for binding pattern analysis.
   */
  kind: 'binding'

  /**
   * The kind of binding pattern used for destructuring.
   */
  pattern: 'object' | 'array'

  /**
   * The elements contained in this binding pattern.
   */
  elements: ReadonlyArray<BindingElementAnalysis>
}

/**
 * Describes how a value is destructured into local variables, specifying the pattern type and its constituent elements.
 */
export const BindingPatternAnalysis: Schema.Schema<BindingPatternAnalysis> = Schema.Struct({
  kind: Schema.Literal('binding'),
  pattern: Schema.Literals(['object', 'array']).annotate({
    description: 'The kind of binding pattern used for destructuring.',
  }),

  elements: Schema.Array(BindingElementAnalysis).annotate({
    description: 'The elements contained in this binding pattern.',
  }),
})
