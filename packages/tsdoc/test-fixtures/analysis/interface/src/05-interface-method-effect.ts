export interface UserService {
  findUser(id: string): Effect.Effect<User, Error, Repository>
  findUser2: Effect.Effect<User, Error, Repository>
  findUser3: (id: string) => Effect.Effect<User, Error, Repository>
}
