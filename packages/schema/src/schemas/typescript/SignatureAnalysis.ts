import { Schema } from 'effect'

import { DependencyCandidate } from './DependencyCandidate.js'
import { MemberAnalysis } from './member/MemberAnalysis.js'
import { TypeAnalysis } from './type/TypeAnalysis.js'

/**
 * Defines the structure for function or callable type signature analysis, containing parameters, return type, generics, and dependency metadata.
 */
export const SignatureAnalysis = Schema.Struct({
  id: Schema.String.pipe(Schema.brand('SignatureId')).annotate({
    description: 'Unique signature identifier, e.g. for overloads.',
  }),

  parameters: Schema.Array(Schema.suspend(() => MemberAnalysis)).annotate({
    description: 'An ordered list of analyzed parameters.',
  }),

  returnType: Schema.optional(Schema.suspend(() => TypeAnalysis)).annotate({
    description: 'Return type text representation.',
  }),

  typeParameters: Schema.optional(Schema.Array(Schema.String)).annotate({
    description: 'Generic type parameter names.',
  }),

  overloadCount: Schema.optional(Schema.Number).annotate({
    description: 'Number of overload signatures.',
  }),

  isOverloadImplementation: Schema.optional(Schema.Boolean).annotate({
    description: 'Whether this signature is the implementation of an overload set.',
  }),

  dependencyCandidates: Schema.Array(DependencyCandidate).annotate({
    description: 'Dependency candidates referenced by this signature.',
  }),
}).annotate({
  description: 'Function or callable type signature analysis.',
})

/**
 * The inferred type of the SignatureAnalysis schema.
 */
export type SignatureAnalysis = typeof SignatureAnalysis.Type
