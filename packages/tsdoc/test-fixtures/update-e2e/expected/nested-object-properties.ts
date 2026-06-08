/**
 * Represents an API response.
 */
export interface ApiResponse {
  /**
   * Response payload data.
   */
  data: {
    /**
     * Unique identifier.
     */
    id: string

    /**
     * Profile information.
     */
    profile: {
      /**
       * Display name.
       */
      displayName: string
    }
  }
}
