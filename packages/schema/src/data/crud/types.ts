import type { Schema } from 'effect'

type DefinitionShape = {
  fields: Record<string, unknown>
  options?: {
    keyMapping?: Partial<Record<string, string>>
  }
}

type ExtractKeyMapping<TDef extends DefinitionShape> = TDef['options'] extends {
  keyMapping?: infer KM
}
  ? KM extends Partial<Record<keyof TDef['fields'] & string, string>>
    ? KM
    : undefined
  : undefined

type MappedFieldKeys<
  TFields extends Record<string, unknown>,
  TKeyMapping extends Partial<Record<keyof TFields & string, string>> | undefined,
> = {
  [K in keyof TFields & string]: TKeyMapping extends Record<string, string>
    ? K extends keyof TKeyMapping
      ? TKeyMapping[K]
      : K
    : K
}[keyof TFields & string]

type KeysAreSubsetOf<A extends string, B extends string> =
  Exclude<A, B> extends never ? true : false

type AssertDefinitionKeysExistInTable<TDef extends DefinitionShape, TTableKeys extends string> =
  KeysAreSubsetOf<MappedFieldKeys<TDef['fields'], ExtractKeyMapping<TDef>>, TTableKeys> extends true
    ? TDef
    : never

export const assertDefinitionKeysExistInTable =
  <TTableKeys extends string>() =>
  <TDef extends DefinitionShape>(def: AssertDefinitionKeysExistInTable<TDef, TTableKeys>) =>
    def
export type CrudSchemasBase<
  Insert extends Schema.Top,
  Select extends Schema.Top,
  Update extends Schema.Top,
> = {
  readonly tags: { entity: string }
  readonly insertSchema: Insert
  readonly selectSchema: Select
  readonly updateSchema: Update
  readonly updatefieldNames: Array<string>
}

export type CrudSchemasWithAudit<
  Insert extends Schema.Top,
  Select extends Schema.Top,
  Update extends Schema.Top,
> = CrudSchemasBase<Insert, Select, Update> & {
  includeAuditFields: true
}

export type CrudSchemasWithoutAudit<
  Insert extends Schema.Top,
  Select extends Schema.Top,
  Update extends Schema.Top,
> = CrudSchemasBase<Insert, Select, Update> & {
  includeAuditFields?: false
}

export type CrudSchemas<
  Insert extends Schema.Top,
  Select extends Schema.Top,
  Update extends Schema.Top,
> = CrudSchemasWithAudit<Insert, Select, Update> | CrudSchemasWithoutAudit<Insert, Select, Update>
