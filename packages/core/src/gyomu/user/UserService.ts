import { Effect } from 'effect';
import { Context } from 'effect';
import { User } from '../../schemas/user.js';

export class UserService extends Context.Service<
  UserService,
  {
    getCurrentUser(): Effect.Effect<User, Error>;
    findById(userId: string): Effect.Effect<User, Error>;
    isMember(user: User, group: User): Effect.Effect<boolean, Error>;
  }
>()('UserService') {}
