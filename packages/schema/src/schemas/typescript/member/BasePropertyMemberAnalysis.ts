import { Schema } from 'effect'
import { TypeAnalysis } from '../type/TypeAnalysis.js'
import { PropertySource } from '../PropertySource.js'
import { IdentifierExpressionAnalysis } from '../expression/Identifier.js'
import { BaseMemberAnalysis } from './BaseMemberAnalysis.js'
import { BindingPatternAnalysis } from './BindingPatternAnalysis.js'

/**
 * Defines the base structure for property member analysis, including metadata for property type, source, modifiers like readonly or optional, and rest parameter status.
 */
export const BasePropertyMemberAnalysis = Schema.Struct({
  kind: Schema.Literal('property'),
  type: Schema.optional(
    Schema.Union([Schema.suspend(() => TypeAnalysis), Schema.Undefined]),
  ).annotate({
    description: 'The type of the property.',
  }),
  binding: Schema.optional(
    Schema.Union([
      Schema.suspend(() => BindingPatternAnalysis),
      Schema.suspend(() => IdentifierExpressionAnalysis),
      Schema.Undefined,
    ]),
  ).annotate({
    description:
      'Describes how the parameter is bound to local variables using an object or array destructuring pattern.',
  }),
  source: PropertySource,
  readonly: Schema.Boolean,
  optional: Schema.Boolean,
  rest: Schema.Boolean.annotate({ description: 'Whether the parameter is a rest parameter.' }),
}).pipe(Schema.fieldsAssign(BaseMemberAnalysis.fields))

/**
 * The inferred type of the BasePropertyMemberAnalysis schema.
 */
export type BasePropertyMemberAnalysis = typeof BasePropertyMemberAnalysis.Type
