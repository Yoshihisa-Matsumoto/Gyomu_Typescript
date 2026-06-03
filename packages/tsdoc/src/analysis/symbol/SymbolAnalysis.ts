import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript/index'
import type { ComplexityMetrics } from '../metrics/ComplexityMetrics.js'
import type { DomainSignals } from '../metrics/DomainSignals.js'
import type { EffectSignals } from '../metrics/EffectSignals.js'
import type { JsDocAnalysis } from '../jsdoc/JsDocAnalysis.js'
import type { SignatureAnalysis, SymbolKind } from './SymbolModel.js'

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
  id: string
  /**
   * Symbol name.
   */
  identity: SymbolIdentity

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
   * Structural and logical complexity metrics.
   */
  complexity?: ComplexityMetrics

  /**
   * Domain-specific semantic signals.
   */
  domainSignals?: DomainSignals

  /**
   * Effect-related semantic signals.
   */
  effectSignals?: EffectSignals

  /**
   * Start offset of the symbol location
   */
  startOffset: number
}

export interface SymbolIDComposite {
  id: string
  qualifiedName: string
}

export const toIdentityKey = (identity: SymbolIdentity): string =>
  `${identity.symbolId}::${identity.signatureId}`
