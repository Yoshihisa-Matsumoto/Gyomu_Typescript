import { Context } from 'effect'
import type { Effect } from 'effect'
import type { User, UserId } from '../../schemas/user.js'

/**
 * Defines the service interface for user management, providing operations to retrieve the current user, find a specific user by ID, and verify membership relations.
 */
export class UserService extends Context.Service<
  UserService,
  {
    getCurrentUser: () => Effect.Effect<User, Error>
    findById: (userId: UserId) => Effect.Effect<User, Error>
    isMember: (user: User, group: User) => Effect.Effect<boolean, Error>
  }
>()('UserService') {}
