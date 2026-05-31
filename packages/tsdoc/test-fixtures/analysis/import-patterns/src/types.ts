export interface User {
  id: string
}

export type UserId = string

export const VERSION = '1.0.0'

export function createUser() {
  return {
    id: 'u1',
  }
}
