export class EverythingClass {
  readonly serviceName = 'user'

  cache?: Map<string, string>

  constructor(private readonly id: string) {}

  getName(): string {
    return this.serviceName
  }

  find<T>(id: string, ...options: Array<string>): Promise<T> {
    throw new Error()
  }

  static create(): EverythingClass {
    return new EverythingClass('1')
  }
}
