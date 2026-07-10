export type RestTuple = [string, ...Array<number>]

export type GenericRest<T extends Array<unknown>> = [...T]

export type MixedRest<T extends Array<unknown>> = [boolean, ...T, string]
