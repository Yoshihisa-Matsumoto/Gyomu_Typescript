import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript/index'
import type { DomainSignals } from '../metrics/DomainSignals.js'

import type { SymbolId } from '../types.js'
import type {
  JsDocAnalysis,
  MemberAnalysis,
  ParsedJsDoc,
  SignatureAnalysis,
  SymbolKind,
  TypeAnalysis,
} from '@gyomu/schema/typescript'

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
   * Symbol name.
   */
  identity: SymbolIdentity

  declarationOrder: number

  /**
   * Symbol type text representation.
   */
  type?: TypeAnalysis

  /**
   * Symbol category.
   */
  kind: SymbolKind

  /**
   * Source code location.
   */
  location: {
    /**
     * Starting line number.
     */
    startLine: number

    /**
     * Ending line number.
     */
    endLine: number
  }

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
  jsDoc?: JsDocAnalysis

  /**
   * Parsed JSDoc/TSDoc
   */
  parsedJsDoc?: Array<ParsedJsDoc>

  /**
   * Domain-specific semantic signals.
   */
  domainSignals?: DomainSignals

  /**
   * Start offset of the symbol location
   */
  startOffset: number

  members: Array<MemberAnalysis>
}

export interface SymbolIDComposite {
  id: string
  qualifiedName: string
}

export const toIdentityKey = (identity: SymbolIdentity): string =>
  `${identity.symbolId}::${identity.signatureId}`
