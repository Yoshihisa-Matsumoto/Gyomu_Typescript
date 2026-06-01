export interface Repository {
  /**
   * Save user.
   */
  save: (id: string) => Promise<void>

  /**
   * Delete user.
   */
  delete: (id: string) => Promise<void>
}
