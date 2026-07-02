/**
 * User type.
 */
export type User = {
  /**
   * User id.
   */
  id: string

  /**
   * User name.
   */
  name: string

  /**
   * Gets display name.
   */
  getDisplayName: () => string
}
