/**
 * Search response.
 */
export interface SearchResponse {
  /**
   * Status.
   */
  status: 'success' | 'error'

  /**
   * Result data.
   */
  data:
    | {
        /**
         * User id.
         */
        id: string

        /**
         * User name.
         */
        name: string
      }
    | {
        /**
         * Error code.
         */
        code: string

        /**
         * Error message.
         */
        message: string
      }

  /**
   * Tags.
   */
  tags: Array<string> | Array<number>
}
