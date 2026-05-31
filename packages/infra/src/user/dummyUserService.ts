import { Effect, Layer } from 'effect'
import { UserService } from '@gyomu/schema/gyomu'
import { UserId } from '@gyomu/schema'

export const DummyUserLayer = Layer.effect(
  UserService,
  Effect.succeed({
    getCurrentUser: () =>
      Effect.succeed({
        userId: UserId.make('testUid'),
        isGroup: false,
        isValid: true,
      }),
    findById: (userId: UserId) =>
      Effect.succeed({
        userId,
        isGroup: false,
        isValid: true,
      }),
    isMember: () => Effect.succeed(false),
  }),
)
