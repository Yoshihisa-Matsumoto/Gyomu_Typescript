/**
 * Represents an API response.
 */
export interface ApiResponse {
  /**
   * Collection of users.
   */
  users: Array<{
    /**
     * Unique user identifier.
     */
    id: string

    /**
     * User profile information.
     */
    profile: {
      /**
       * Display name.
       */
      displayName: string
    }
  }>
}
