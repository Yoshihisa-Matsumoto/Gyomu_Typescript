export interface Formatter {
  /**
   * Format string.
   */
  format(value: string): string

  /**
   * Format number.
   */
  format(value: number): string
}
