export interface EverythingInterface {
  readonly serviceName: string

  cache?: Map<string, string>

  getName: () => string

  find: <T>(id: string, ...options: Array<string>) => Promise<T>
}
