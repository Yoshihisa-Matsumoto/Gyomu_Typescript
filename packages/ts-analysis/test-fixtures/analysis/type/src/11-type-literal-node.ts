export type PropertyOnly = {
  value: string
}

export type MethodOnly = {
  getName(id: string): string
}

export type FunctionProperty = {
  callback: (x: number) => string
}

export type Callable = {
  (value: string): number
}

export type Indexed = {
  [key: string]: number
}

export type Constructable = {
  new (): Date
}

export type EmptyObject = {}
