export interface User {
  id: string
  name: string
}

export function createUser(id: string, name: string): User {
  return {
    id,
    name,
  }
}

export const VERSION = '1.0.0'
