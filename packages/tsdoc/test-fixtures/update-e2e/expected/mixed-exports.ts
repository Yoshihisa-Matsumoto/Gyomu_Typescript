/**
 * User entity representing a system user.
 */
export class User {
  constructor(public name: string) {}
}

/**
 * Create a new User instance.
 */
export function createUser(name: string) {
  return new User(name)
}

/**
 * Current version of the system.
 */
export const VERSION = '2.0.0'
