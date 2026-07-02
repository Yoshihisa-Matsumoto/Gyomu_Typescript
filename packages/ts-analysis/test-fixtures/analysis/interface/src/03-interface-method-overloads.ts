export interface MethodOverloadInterface {
  find: ((id: string) => string) & ((ids: Array<string>) => Array<string>)
}
