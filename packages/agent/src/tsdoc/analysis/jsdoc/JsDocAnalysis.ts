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
  descriptionLength: number

  /**
   * Whether a summary description exists.
   */
  hasSummary: boolean

  /**
   * Whether a @remarks section exists.
   */
  hasRemarks: boolean

  /**
   * Whether an @example section exists.
   */
  hasExample: boolean

  /**
   * Whether a @deprecated tag exists.
   */
  hasDeprecated: boolean

  /**
   * Whether parameter tags exist.
   */
  hasParamTags: boolean

  /**
   * Whether a @returns tag exists.
   */
  hasReturnTag: boolean

  /**
   * Whether a @throws tag exists.
   */
  hasThrowsTag: boolean

  /**
   * Whether a @template tag exists.
   */
  hasTemplateTag: boolean

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
   */
  hasProtectedRegion: boolean

  /**
   * Identifier of the tool or generator that
   * originally created the documentation.
   *
   * Example:
   * 'gyomu-tsdoc'
   */
  generatedBy?: string
}
