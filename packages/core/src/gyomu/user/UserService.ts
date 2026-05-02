import { Effect } from 'effect';
import { ServiceMap } from 'effect';
import { User } from '../../schemas/user.js';

export class UserService extends ServiceMap.Service<
  UserService,
  {
    getCurrentUser(): Effect.Effect<User, Error>;
    findById(userId: string): Effect.Effect<User, Error>;
    isMember(user: User, group: User): Effect.Effect<boolean, Error>;
  }
>()('UserService') {}
