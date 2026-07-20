import { Schema } from 'effect'

import { DependencyCandidate } from './DependencyCandidate.js'
import { LineRange } from './LineRange.js'
import { JsDocAnalysis } from './jsdoc/JsDocAnalysis.js'
import { ParsedJsDoc } from './jsdoc/ParsedJsDoc.js'
import { MemberAnalysis } from './member/MemberAnalysis.js'
import { SignatureAnalysis } from './SignatureAnalysis.js'
import { SymbolIdentity } from './SymbolIdentity.js'
import { SymbolKind } from './SymbolKind.js'
import { TypeAnalysis } from './type/TypeAnalysis.js'

/**
 * Detailed analysis result for a symbol declaration, containing identification, structural metadata, location, signature, and extracted JSDoc information.
 */
export const SymbolAnalysis = Schema.Struct({
  id: Schema.String.pipe(Schema.brand('SymbolId')).annotate({
    description:
      'Stable identifier of the symbol. This identifier must remain stable across repeated analyses of the same source code. It is used as a correlation key for generated documentation, merge operations, snapshots, and other analysis artifacts.',
  }),

  identity: SymbolIdentity.annotate({
    description: 'Symbol name/identity details.',
  }),

  declarationOrder: Schema.Number.annotate({
    description: 'The index of the symbol in its parent declaration list.',
  }),

  type: Schema.optional(Schema.suspend(() => TypeAnalysis)).annotate({
    description: 'Symbol type text representation.',
  }),

  kind: SymbolKind.annotate({
    description: 'Symbol category.',
  }),

  location: LineRange.annotate({
    description: 'Source code location of the symbol.',
  }),

  signature: Schema.suspend(() => SignatureAnalysis).annotate({
    description: 'Signature information for callable or typed symbols.',
  }),

  snippet: Schema.String.annotate({
    description: 'Code snippet representing the symbol declaration.',
  }),

  jsDoc: Schema.optional(JsDocAnalysis).annotate({
    description: 'Existing JSDoc/TSDoc analysis.',
  }),

  parsedJsDoc: Schema.optional(Schema.Array(ParsedJsDoc)).annotate({
    description: 'Parsed JSDoc/TSDoc.',
  }),

  startOffset: Schema.Number.annotate({
    description: 'The character offset where the symbol declaration begins in the source file.',
  }),

  members: Schema.Array(Schema.suspend(() => MemberAnalysis)).annotate({
    description: 'A collection of child members associated with the symbol.',
  }),

  dependencyCandidates: Schema.Array(DependencyCandidate).annotate({
    description: 'Dependency candidates referenced by this symbol.',
  }),

  /**
   * Leading whitespace of the declaration line, used when generating or updating JSDoc/TSDoc comments.
   */
  docIndent: Schema.String.annotate({
    description:
      'Leading whitespace of the declaration line, used when generating or updating JSDoc/TSDoc comments.',
  }),
}).annotate({
  description: 'Detailed analysis result for a symbol declaration.',
})

/**
 * TypeScript type representation of the SymbolAnalysis schema.
 */
export type SymbolAnalysis = typeof SymbolAnalysis.Type
