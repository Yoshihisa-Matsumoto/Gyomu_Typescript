import { Schema } from 'effect'
import { TypeAnalysis } from '../type/TypeAnalysis.js'
import { PropertySource } from '../PropertySource.js'
import { BaseMemberAnalysis } from './BaseMemberAnalysis.js'

/**
 * Represents a non-documentable type property.
 */
export const BasePropertyMemberAnalysis = Schema.Struct({
  kind: Schema.Literal('property'),
  type: Schema.Union([Schema.suspend(() => TypeAnalysis), Schema.Undefined]).annotate({
    description: 'The type of the property.',
  }),
  source: PropertySource,
  readonly: Schema.Boolean,
  optional: Schema.Boolean,
  rest: Schema.Boolean.annotate({ description: 'Whether the parameter is a rest parameter.' }),
}).pipe(Schema.fieldsAssign(BaseMemberAnalysis.fields))

export type BasePropertyMemberAnalysis = typeof BasePropertyMemberAnalysis.Type
