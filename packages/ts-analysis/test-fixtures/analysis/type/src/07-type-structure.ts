/**
 * ============================================================
 * Base types
 * ============================================================
 */

interface User {
  id: number
  name: string
  active: boolean
}

interface ApiResponse<T> {
  data: T
  error?: string
}

interface Person {
  name: string
  age: number
}

type Keys = 'id' | 'name'

/**
 * ============================================================
 * IndexedAccessStructureAnalysis
 * ============================================================
 */

export type IndexedAccess1 = User['name']
export type IndexedAccess2 = ApiResponse<User>['data']
export type IndexedAccess3 = User[keyof User]

/**
 * ============================================================
 * MappedStructureAnalysis
 * ============================================================
 */

export type Mapped1 = {
  [K in keyof User]: User[K]
}

export type Mapped2 = {
  readonly [K in keyof User]?: User[K]
}

export type Mapped3<T> = {
  [K in keyof T as `new_${string & K}`]: T[K]
}

/**
 * ============================================================
 * TypePredicateAnalysis
 * ============================================================
 */

export function isUser(value: unknown): value is User {
  return typeof value === 'object' && value !== null
}

export function hasName(value: unknown): value is { name: string } {
  return typeof value === 'object' && value !== null
}

/**
 * ============================================================
 * ConditionalStructureAnalysis
 * ============================================================
 */

export type Conditional1<T> = T extends string ? number : boolean

export type Conditional2<T> = T extends Promise<infer U> ? U : T

/**
 * ============================================================
 * InferStructureAnalysis
 * ============================================================
 */

export type Infer1<T> = T extends Array<infer U> ? U : never

export type Infer2<T> = T extends (...args: any[]) => infer R ? R : never

export type Infer3<T> = T extends Promise<infer P> ? P : never

/**
 * ============================================================
 * TypeOperatorStructureAnalysis
 * ============================================================
 */

export type TypeOperator1 = keyof User
export type TypeOperator2 = unique symbol
export type TypeOperator3 = readonly string[]
export type TypeOperator4 = typeof Math
export type TypeOperator5 = keyof typeof Math

/**
 * ============================================================
 * ConstructorStructureAnalysis
 * ============================================================
 */

export type Constructor1 = new () => User

export type Constructor2 = abstract new (name: string) => Person

/**
 * ============================================================
 * ParenthesizedStructureAnalysis
 * ============================================================
 */

export type Parenthesized1 = string

export type Parenthesized2 = (string | number)[]

export type Parenthesized3 = (x: string) => number

/**
 * ============================================================
 * TemplateLiteralStructureAnalysis
 * ============================================================
 */

export type TemplateLiteral1 = `id_${string}`

export type TemplateLiteral2 = `${keyof User}_${number}`

export type TemplateLiteral3<T extends string> = `prefix_${T}`

/**
 * ============================================================
 * TupleStructureAnalysis
 * ============================================================
 */

export type Tuple1 = [number, string]

export type Tuple2 = readonly [number, string]

export type Tuple3 = [id: number, name?: string, ...rest: boolean[]]

/**
 * ============================================================
 * ImportStructureAnalysis
 * ============================================================
 */

export type Import1 = import('typescript').Type

export type Import2 = import('typescript').Symbol

/**
 * ============================================================
 * ThisStructureAnalysis
 * ============================================================
 */

export type This1 = this

interface Fluent {
  value: number

  add(n: number): this

  clone(): this
}
