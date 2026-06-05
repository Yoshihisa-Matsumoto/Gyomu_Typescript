export class ComplexTypeClass {
  user: User | undefined

  find(): Promise<Array<User>> {
    throw new Error()
  }
}

interface User {
  id: string
}
