/**
 * API response.
 */
export interface ApiResponse {
  /**
   * Response payload.
   */
  data: {
    /**
     * User information.
     */
    user: {
      /**
       * User id.
       */
      readonly id: string

      /**
       * User name.
       */
      name?: string
    }

    /**
     * Metadata.
     */
    metadata: {
      /**
       * Creation time.
       */
      createdAt: string

      /**
       * Tags.
       */
      tags: string[]
    }
  }
}
