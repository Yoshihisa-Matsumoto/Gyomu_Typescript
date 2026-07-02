/**
 * User contract.
 */
export interface UserService {
  /**
   * User id.
   */
  id: string

  /**
   * User name.
   */
  name: string

  /**
   * Gets user.
   *
   * @param id User id
   */
  getUser: (id: string) => string
}
