export class StaticClass {
  static version = '1.0'

  static create(): StaticClass {
    return new StaticClass()
  }
}
