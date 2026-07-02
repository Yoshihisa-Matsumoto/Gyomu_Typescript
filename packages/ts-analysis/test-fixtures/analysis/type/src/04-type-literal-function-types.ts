export type FunctionTypesType = {
  simple: () => string

  withParameter: (id: string) => string

  generic: <T>(value: T) => Promise<T>

  rest: (...messages: Array<string>) => void
}
