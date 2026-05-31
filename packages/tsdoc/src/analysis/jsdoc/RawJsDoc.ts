/**
 * Existing JSDoc/TSDoc records
 */
export interface RawJsDoc {
  rawText: string
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
}
