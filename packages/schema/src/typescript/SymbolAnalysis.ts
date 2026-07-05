import type { SymbolKind } from '../schemas/typescript/SymbolKind.js'
import type { JsDocAnalysis } from '../schemas/typescript/jsdoc/JsDocAnalysis.js'
import type { ParsedJsDoc } from '../schemas/typescript/jsdoc/ParsedJsDoc.js'
import type { DependencyCandidate } from '../schemas/typescript/DependencyCandidate.js'
import type { SymbolIdentity } from '../schemas/typescript/SymbolIdentity.js'
import type { LineRange } from '../schemas/typescript/LineRange.js'

import type { MemberAnalysis } from './MemberAnalysis.js'
import type { SignatureAnalysis } from './SymbolModel.js'
import type { SymbolId } from './types.js'
import type { TypeAnalysis } from '../schemas/typescript/type/TypeAnalysis.js'

/**
 * Detailed analysis result for a symbol declaration.
 */
export interface SymbolAnalysis {
  /**
   * Stable identifier of the symbol.
   *
   * @remarks
   * This identifier must remain stable across repeated analyses of the same source code.
   * It is used as a correlation key for generated documentation, merge operations,
   * snapshots, and other analysis artifacts.
   *
   * Recommended format:
   *
   * ```text
   * <relative-file-path>::<qualified-symbol-name>
   * ```
   *
   * Example:
   *
   * ```text
   * src/user/UserService.ts::UserService.getUser
   * ```
   */
  id: SymbolId

  /**
   * Symbol name/identity details.
   */
  identity: SymbolIdentity

  /**
   * The index of the symbol in its parent declaration list.
   */
  declarationOrder: number

  /**
   * Symbol type text representation.
   */
  type: TypeAnalysis | undefined

  /**
   * Symbol category.
   */
  kind: SymbolKind

  /**
   * Source code location of the symbol.
   */
  location: LineRange

  /**
   * Signature information for callable or typed symbols.
   */
  signature: SignatureAnalysis

  /**
   * Code snippet representing the symbol declaration.
   */
  snippet: string

  /**
   * Existing JSDoc/TSDoc analysis.
   */
  jsDoc: JsDocAnalysis | undefined

  /**
   * Parsed JSDoc/TSDoc.
   */
  parsedJsDoc: Array<ParsedJsDoc> | undefined

  /**
   * The character offset where the symbol declaration begins in the source file.
   */
  startOffset: number

  /**
   * A collection of child members associated with the symbol.
   */
  members: Array<MemberAnalysis>

  dependencyCandidates: ReadonlyArray<DependencyCandidate>
}
