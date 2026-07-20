export class User {
  constructor(public name: string) {}
}

export function createUser(name: string) {
  return new User(name)
}

export const VERSION = '2.0.0'
