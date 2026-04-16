import { Effect } from 'effect';
import { Layer } from 'effect';
import { UserService } from '../../gyomu/user/userService.js';

export const DummyUserLayer = Layer.effect(
  UserService,
  Effect.succeed({
    getCurrentUser: () =>
      Effect.succeed({
        userId: 'testUid',
        isGroup: false,
        isValid: true,
      }),
    findById: (userId: string) =>
      Effect.succeed({
        userId,
        isGroup: false,
        isValid: true,
      }),
    isMember: () => Effect.succeed(false),
  }),
);
