/**
 * Domain-related semantic indicators.
 */
export interface DomainSignals {
  /**
   * Whether domain-specific terminology was detected.
   */
  hasDomainWords: boolean

  /**
   * Matched domain-specific words.
   */
  matchedWords: Array<string>

  /**
   * Classified domain categories.
   */
  domainCategory?: Array<string>
}
