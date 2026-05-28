/**
 * Documentation prioritization scoring hints.
 */
export interface ScoreHints {
  /**
   * Overall documentation importance score.
   */
  documentationImportance: number

  /**
   * Estimated maintenance risk score.
   */
  maintenanceRisk: number

  /**
   * Public API surface importance score.
   */
  apiSurfaceScore: number

  /**
   * Domain criticality score.
   */
  domainCriticality: number

  /**
   * Complexity-based importance score.
   */
  complexityScore: number
}
