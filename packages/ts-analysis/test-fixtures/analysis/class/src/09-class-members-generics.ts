export class GenericClass {
  find<T>(id: string): T {
    throw new Error()
  }
}
