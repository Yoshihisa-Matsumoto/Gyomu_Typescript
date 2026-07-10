import type { Effect, Schema } from 'effect'

interface DBError {}

export interface User {
  id: string
  name: string
}

export interface Box<T> {
  value: T
}

export namespace Namespace {
  export interface Member {
    enabled: boolean
  }
}

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
