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
   * Symbol name.
   */
  name: string

  /**
   * Symbol category.
   */
  kind: SymbolKind

  /**
   * Whether the symbol is exported publicly.
   */
  exported: boolean

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
  signature?: SignatureAnalysis

  /**
   * Existing JSDoc/TSDoc analysis.
   */
  jsDoc?: JsDocAnalysis

  /**
   * Structural and logical complexity metrics.
   */
  complexity: ComplexityMetrics

  /**
   * Domain-specific semantic signals.
   */
  domainSignals: DomainSignals

  /**
   * Effect-related semantic signals.
   */
  effectSignals: EffectSignals
}
