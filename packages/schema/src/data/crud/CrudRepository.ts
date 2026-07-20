import type { Effect, Schema } from 'effect'
import type { DBError } from '../../error/DBError.js'

/**
 * Defines a generic repository interface for standard CRUD operations.
 */
export type CrudRepository<
  Insert extends Schema.Top,
  Select extends Schema.Top,
  Update extends Schema.Top,
> = {
  /**
   * Creates new records in the database.
   *
   * @returns An Effect containing the array of successfully created records.
   */
  readonly create: (
    data: Array<Schema.Schema.Type<Insert>>,
    modifiedBy?: string,
  ) => Effect.Effect<Array<Schema.Schema.Type<Select>>, DBError>

  /**
   * Finds a single record by its unique identifier.
   *
   * @returns An Effect that yields the record if found, otherwise undefined.
   */
  readonly findById: (id: string) => Effect.Effect<Schema.Schema.Type<Select> | undefined, DBError>

  /**
   * Updates multiple existing records in the database.
   *
   * @returns An Effect containing the array of updated records.
   */
  readonly updateRecords: (
    data: Array<Schema.Schema.Type<Update>>,
    modifiedBy?: string,
  ) => Effect.Effect<ReadonlyArray<Schema.Schema.Type<Select>>, DBError>

  /**
   * Deletes records from the database by their identifiers.
   *
   * @returns An Effect that yields the count of deleted records.
   */
  readonly deleteRecords: (ids: Array<string>) => Effect.Effect<number, DBError>

  /**
   * Synchronizes the database state with the provided diff result.
   *
   * @returns An Effect containing the result of the synchronization, including lists of affected rows and the count of deletions.
   */
  readonly synchronizeRecords: <
    TInsert extends Schema.Schema.Type<Insert>,
    TSelect extends Schema.Schema.Type<Select> &
      Readonly<{
        id: string
      }> & { [field: string]: any },
    TUpdate extends Schema.Schema.Type<Update>,
    TField extends keyof (TInsert | TUpdate),
  >(args: {
    diffResult: {
      inserts: ReadonlyArray<TInsert>
      updates: ReadonlyArray<{
        id: string
        existing: TSelect
        incoming: TUpdate
        changedFields: ReadonlyArray<TField>
        changedValues: Partial<Pick<TUpdate, TField>>
      }>
      deletes: ReadonlyArray<TSelect>
    }
    modifiedBy?: string
    deleteRequired?: boolean
  }) => Effect.Effect<
    {
      insertedRows: Array<Schema.Schema.Type<Select>>
      updatedRows: Array<Schema.Schema.Type<Select>>
      deletedCount: number
    },
    DBError
  >
}

/**
 * An interface providing a findAll operation for selecting all records.
 */
export type WithFindAll<Select extends Schema.Top> = {
  /**
   * Retrieves all records from the database.
   *
   * @returns An Effect that yields a readonly array of all records.
   */
  readonly findAll: () => Effect.Effect<ReadonlyArray<Schema.Schema.Type<Select>>, DBError>
}

type FindByMethod<Select extends Schema.Top, MethodName extends string> = {
  readonly [K in MethodName]: (
    value: string,
  ) => Effect.Effect<ReadonlyArray<Schema.Schema.Type<Select>>, DBError>
}

type FindByColumnMeta<Column extends string> = {
  readonly findByColumnName: Column
}

/**
 * An interface providing functionality to query records by a specific column.
 */
export type WithFindByColumn<
  Select extends Schema.Top,
  Column extends string,
  MethodName extends string,
> = FindByMethod<Select, MethodName> & FindByColumnMeta<Column>

type CrudSchemaSet = {
  readonly insertSchema: Schema.Top
  readonly selectSchema: Schema.Top
  readonly updateSchema: Schema.Top
}

type CrudRepositoryWithFindAll<
  Insert extends Schema.Top,
  Select extends Schema.Top,
  Update extends Schema.Top,
> = CrudRepository<Insert, Select, Update> & WithFindAll<Select>

type CrudRepositoryWithFindByColumn<
  Insert extends Schema.Top,
  Select extends Schema.Top,
  Update extends Schema.Top,
  Column extends string,
  MethodName extends string,
> = CrudRepository<Insert, Select, Update> & WithFindByColumn<Select, Column, MethodName>

type CrudRepositoryWithFindAllAndFindByColumn<
  Insert extends Schema.Top,
  Select extends Schema.Top,
  Update extends Schema.Top,
  Column extends string,
  MethodName extends string,
> = CrudRepository<Insert, Select, Update> &
  WithFindAll<Select> &
  WithFindByColumn<Select, Column, MethodName>

/**
 * A CrudRepository implementation derived from a schema set.
 */
export type CrudRepositoryFromSchemas<TSchemas extends CrudSchemaSet> = CrudRepository<
  TSchemas['insertSchema'],
  TSchemas['selectSchema'],
  TSchemas['updateSchema']
>

/**
 * Defines a repository type that includes standard CRUD operations and a find-all capability, inferred from the provided schema set.
 */
export type CrudRepositoryFromSchemasWithFindAll<TSchemas extends CrudSchemaSet> =
  CrudRepositoryWithFindAll<
    TSchemas['insertSchema'],
    TSchemas['selectSchema'],
    TSchemas['updateSchema']
  >

/**
 * Defines a repository type that includes standard CRUD operations and a column-based lookup, inferred from the provided schema set.
 */
export type CrudRepositoryFromSchemasWithFindByColumn<
  TSchemas extends CrudSchemaSet,
  Column extends string,
  MethodName extends string,
> = CrudRepositoryWithFindByColumn<
  TSchemas['insertSchema'],
  TSchemas['selectSchema'],
  TSchemas['updateSchema'],
  Column,
  MethodName
>

/**
 * Defines a repository type that includes standard CRUD operations, find-all support, and a column-based lookup, inferred from the provided schema set.
 */
export type CrudRepositoryFromSchemasWithFindAllAndFindByColumn<
  TSchemas extends CrudSchemaSet,
  Column extends string,
  MethodName extends string,
> = CrudRepositoryWithFindAllAndFindByColumn<
  TSchemas['insertSchema'],
  TSchemas['selectSchema'],
  TSchemas['updateSchema'],
  Column,
  MethodName
>
