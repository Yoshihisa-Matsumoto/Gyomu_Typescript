export type OverloadType = {
  find: ((id: string) => string) & ((ids: Array<string>) => Array<string>)
}
