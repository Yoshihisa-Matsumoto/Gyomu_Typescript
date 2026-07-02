export type UserService = {
  findUser(id: string): Effect.Effect<User, Error, Repository>
}
