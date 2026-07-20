export class ReadonlyClass {
  readonly serviceName: string = 'user'

  getServiceName(): string {
    return this.serviceName
  }
}
