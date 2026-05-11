import type { Effect, Schema } from 'effect'
import type { DBError } from '../../error/DBError.js'

export type CrudRepository<
  Insert extends Schema.Top,
  Select extends Schema.Top,
  Update extends Schema.Top,
> = {
  readonly create: (
    data: Array<Schema.Schema.Type<Insert>>,
    modifiedBy?: string,
  ) => Effect.Effect<Array<Schema.Schema.Type<Select>>, DBError>
  readonly findById: (id: string) => Effect.Effect<Schema.Schema.Type<Select> | undefined, DBError>
  readonly updateRecords: (
    data: Array<Schema.Schema.Type<Update>>,
    modifiedBy?: string,
  ) => Effect.Effect<ReadonlyArray<Schema.Schema.Type<Select>>, DBError>
  readonly deleteRecords: (ids: Array<string>) => Effect.Effect<number, DBError>
  readonly synchronizeRecords: <
    TInsert extends Schema.Schema.Type<Insert>,
    TSelect extends TInsert &
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

export type WithFindAll<Select extends Schema.Top> = {
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

export type CrudRepositoryFromSchemas<TSchemas extends CrudSchemaSet> = CrudRepository<
  TSchemas['insertSchema'],
  TSchemas['selectSchema'],
  TSchemas['updateSchema']
>

export type CrudRepositoryFromSchemasWithFindAll<TSchemas extends CrudSchemaSet> =
  CrudRepositoryWithFindAll<
    TSchemas['insertSchema'],
    TSchemas['selectSchema'],
    TSchemas['updateSchema']
  >

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
