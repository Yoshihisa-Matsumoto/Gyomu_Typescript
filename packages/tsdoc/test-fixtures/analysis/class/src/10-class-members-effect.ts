import type { Effect } from 'effect'

export class EffectClass {
  findUser(id: string): Effect.Effect<User, Error, Repository> {
    throw new Error()
  }
}

interface User {
  id: string
}

interface Repository {
  id: string
}
