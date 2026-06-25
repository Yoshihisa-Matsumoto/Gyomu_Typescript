/**
 * Represents a section that is protected, including its identifier and associated priority score.
 */
export interface ProtectedSection {
  /**
   * The identifier of the section to be protected.
   */
  targetSection: string

  /**
   * A numeric score assigned to the protected section, typically representing priority or weight.
   */
  score: number
}
