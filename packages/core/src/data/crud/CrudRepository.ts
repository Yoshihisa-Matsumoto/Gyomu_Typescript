import { Effect, Schema } from 'effect';
import { DBError } from '../../errors.js';

export type CrudRepository<
  Insert extends Schema.Top,
  Select extends Schema.Top,
  Update extends Schema.Top,
> = {
  readonly create: (
    data: Schema.Schema.Type<Insert>[],
    modifiedBy?: string,
  ) => Effect.Effect<Schema.Schema.Type<Select>[], DBError>;
  readonly findById: (
    id: string,
  ) => Effect.Effect<Schema.Schema.Type<Select> | undefined, DBError>;
  readonly updateRecords: (
    data: Schema.Schema.Type<Update>[],
    modifiedBy?: string,
  ) => Effect.Effect<readonly Schema.Schema.Type<Select>[], DBError>;
  readonly deleteRecords: (ids: string[]) => Effect.Effect<bigint, DBError>;
  readonly synchronizeRecords: <
    TInsert extends Schema.Schema.Type<Insert>,
    TSelect extends TInsert &
      Readonly<{
        id: string;
      }> & { [field: string]: any },
    TUpdate extends Schema.Schema.Type<Update>,
    TField extends keyof (TInsert | TUpdate),
  >(args: {
    diffResult: {
      inserts: readonly TInsert[];
      updates: readonly {
        id: string;
        existing: TSelect;
        incoming: TUpdate;
        changedFields: readonly TField[];
        changedValues: Partial<Pick<TUpdate, TField>>;
      }[];
      deletes: readonly TSelect[];
    };
    modifiedBy?: string;
    deleteRequired?: boolean;
  }) => Effect.Effect<
    {
      insertedRows: Schema.Schema.Type<Select>[];
      updatedRows: Schema.Schema.Type<Select>[];
      deletedCount: bigint;
    },
    DBError
  >;
};

export type WithFindAll<Select extends Schema.Top> = {
  readonly findAll: () => Effect.Effect<
    readonly Schema.Schema.Type<Select>[],
    DBError
  >;
};

type FindByMethod<Select extends Schema.Top, MethodName extends string> = {
  readonly [K in MethodName]: (
    value: string,
  ) => Effect.Effect<readonly Schema.Schema.Type<Select>[], DBError>;
};

type FindByColumnMeta<Column extends string> = {
  readonly findByColumnName: Column;
};

export type WithFindByColumn<
  Select extends Schema.Top,
  Column extends string,
  MethodName extends string,
> = FindByMethod<Select, MethodName> & FindByColumnMeta<Column>;

type CrudSchemaSet = {
  readonly insertSchema: Schema.Top;
  readonly selectSchema: Schema.Top;
  readonly updateSchema: Schema.Top;
};

type CrudRepositoryWithFindAll<
  Insert extends Schema.Top,
  Select extends Schema.Top,
  Update extends Schema.Top,
> = CrudRepository<Insert, Select, Update> & WithFindAll<Select>;

type CrudRepositoryWithFindByColumn<
  Insert extends Schema.Top,
  Select extends Schema.Top,
  Update extends Schema.Top,
  Column extends string,
  MethodName extends string,
> = CrudRepository<Insert, Select, Update> &
  WithFindByColumn<Select, Column, MethodName>;

type CrudRepositoryWithFindAllAndFindByColumn<
  Insert extends Schema.Top,
  Select extends Schema.Top,
  Update extends Schema.Top,
  Column extends string,
  MethodName extends string,
> = CrudRepository<Insert, Select, Update> &
  WithFindAll<Select> &
  WithFindByColumn<Select, Column, MethodName>;

export type CrudRepositoryFromSchemas<TSchemas extends CrudSchemaSet> =
  CrudRepository<
    TSchemas['insertSchema'],
    TSchemas['selectSchema'],
    TSchemas['updateSchema']
  >;

export type CrudRepositoryFromSchemasWithFindAll<
  TSchemas extends CrudSchemaSet,
> = CrudRepositoryWithFindAll<
  TSchemas['insertSchema'],
  TSchemas['selectSchema'],
  TSchemas['updateSchema']
>;

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
>;

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
>;
