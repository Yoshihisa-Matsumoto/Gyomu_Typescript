import type { GeneratorMarker } from './ProtectedRegion.js'

/**
 * Existing JSDoc/TSDoc quality analysis.
 */
export interface JsDocAnalysis {
  /**
   * Whether documentation exists.
   */
  exists: boolean

  /**
   * Length of the summary description.
   */
  summaryLength: number

  /**
   * Whether a summary description exists.
   */
  hasSummary: boolean

  /**
   * Whether a @remarks section exists.
   *
   */
  hasRemarks: boolean

  /**
   * Count of @example section.
   *
   */
  exampleCount: number

  /**
   * Whether a @deprecated tag exists.
   *
   */
  hasDeprecated: boolean

  /**
   * Count of parameter tags.
   */
  paramCount: number

  /**
   * Whether a @returns tag exists.
   *
   */
  hasReturnTag: boolean

  /**
   * Count of @throws tag.
   *
   */
  throwsCount: number

  /**
   * Count of @template tag.
   *
   */
  templateCount: number

  /**
   * Total tag count.
   */
  tagCount: number

  /**
   * Estimated documentation quality score.
   */
  qualityScore?: number

  /**
   * Whether the documentation contains sections
   * that appear to have been manually edited by a human.
   *
   * Used to reduce aggressive overwrites during
   * automated TSDoc updates.
   */
  hasHumanEditedSections: boolean

  /**
   * Whether the documentation contains explicitly
   * protected regions that must not be modified
   * by automated tools.
   *
   * Protected regions may use markers such as:
   *
   * <!-- tsdoc-preserve-start -->
   * <!-- tsdoc-preserve-end -->
   *
   *
   */
  hasProtectedRegion: boolean

  /**
   * Identifier of the tool or generator that
   * originally created the documentation.
   *
   * Example:
   * 'gyomu-tsdoc'
   */
  generators: Array<GeneratorMarker>
}
