import type { ImportedType } from './shared.js'

class LocalClass {}

export class GenericClass<T extends ImportedType, U extends LocalClass> {
  method<A extends ImportedType, B extends LocalClass>(value: A): B {
    return {} as B
  }
}
