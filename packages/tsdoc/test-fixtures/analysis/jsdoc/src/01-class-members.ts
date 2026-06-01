/**
 * User service.
 */
export class UserService {
  /**
   * User name.
   */
  name: string = ''

  /**
   * Creates service.
   */
  constructor() {}

  /**
   * Gets user.
   *
   * @param id User id
   * @returns User name
   */
  getUser(id: string): string {
    return id
  }

  /**
   * Deletes user.
   */
  private deleteUser(): void {}
}
