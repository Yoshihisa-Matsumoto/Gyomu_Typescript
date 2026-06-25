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

/**
 * Asserts that all keys in the provided definition exist in the specified database table keys.
 *
 * @param def The schema definition to validate.
 *
 * @returns The provided definition.
 */
export const assertDefinitionKeysExistInTable =
  <TTableKeys extends string>() =>
  <TDef extends DefinitionShape>(def: AssertDefinitionKeysExistInTable<TDef, TTableKeys>) =>
    def

/**
 * Defines the base structure for CRUD operations, containing schemas for insert, select, and update actions alongside entity metadata.
 */
export type CrudSchemasBase<
  Insert extends Schema.Top,
  Select extends Schema.Top,
  Update extends Schema.Top,
> = {
  /**
   * Metadata tags associated with the entity.
   */
  readonly tags: { entity: string }

  /**
   * Schema for insert operations.
   */
  readonly insertSchema: Insert

  /**
   * Schema for select operations.
   */
  readonly selectSchema: Select

  /**
   * Schema for update operations.
   */
  readonly updateSchema: Update

  /**
   * List of field names that are allowed in update operations.
   */
  readonly updatefieldNames: Array<string>
}

/**
 * Extends CrudSchemasBase with audit field inclusion enabled.
 */
export type CrudSchemasWithAudit<
  Insert extends Schema.Top,
  Select extends Schema.Top,
  Update extends Schema.Top,
> = CrudSchemasBase<Insert, Select, Update> & {
  includeAuditFields: true
}

/**
 * Extends CrudSchemasBase with audit field inclusion optionally disabled.
 */
export type CrudSchemasWithoutAudit<
  Insert extends Schema.Top,
  Select extends Schema.Top,
  Update extends Schema.Top,
> = CrudSchemasBase<Insert, Select, Update> & {
  includeAuditFields?: false
}

/**
 * A union type representing CRUD schemas either with or without audit fields.
 */
export type CrudSchemas<
  Insert extends Schema.Top,
  Select extends Schema.Top,
  Update extends Schema.Top,
> = CrudSchemasWithAudit<Insert, Select, Update> | CrudSchemasWithoutAudit<Insert, Select, Update>
