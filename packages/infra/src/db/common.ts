import { Effect, Schema } from 'effect';
import { DB } from '../generated/db.js';
import { DBError } from '@gyomu/core';
import {
  Insertable,
  Kysely,
  Selectable,
  DeleteResult,
  UpdateResult,
} from 'kysely';
import { fromPromise } from '@gyomu/core/shared/effect';
import { CrudSchemas } from '@gyomu/core/data';
import { generateUuid7 } from '@gyomu/core/shared';
import {
  CrudRepository,
  WithFindAll,
  WithFindByColumn,
} from '@gyomu/core/data';
import {
  LocalDate,
  convertToSchemaObjectWithEffect,
  convertFromSchemaObjectWithEffect,
} from '@gyomu/core/shared/entity';
import { ValueError } from '@gyomu/core';
import { SchemaValidationError } from '@gyomu/core';
export type TablesWithId = {
  [K in keyof DB]: DB[K] extends { id: any } ? K : never;
}[keyof DB];

// type FindableStringColumns = {

// }

export function toSqlDate(localDate: LocalDate): Date {
  return new Date(`${localDate}T00:00:00+09:00`);
}
const getNewTimestamp = () => new Date();

const selectRecordById =
  <
    T extends TablesWithId,
    Insert extends Schema.Top,
    Select extends Schema.Top,
    Update extends Schema.Top,
  >(
    db: Kysely<DB>,
    table: T,
    schema: CrudSchemas<Insert, Select, Update>,
  ) =>
  (id: string) =>
    Effect.gen(function* () {
      const record = yield* fromPromise(DBError, () => ({
        message: `fail to select ${table} by id = ${id}`,
        operation: 'select' as const,
        params: id,
        table,
      }))(async () => {
        const query = db.selectFrom(table).selectAll();
        return await (query as any).where('id', '=', id).executeTakeFirst();
      });
      if (!record) return undefined;
      return yield* convertToSchemaObjectWithEffect(schema.tags.entity)(
        schema.selectSchema,
        record,
      );
    });

type StringColumnKeys<T> = {
  [K in keyof T]-?: T[K] extends string | null | undefined ? K : never;
}[keyof T] &
  string;

const selectRecordsByColumn =
  <
    const T extends TablesWithId,
    Insert extends Schema.Top,
    Select extends Schema.Top,
    Update extends Schema.Top,
  >(
    db: Kysely<DB>,
    args: {
      table: TablesWithId;
      schema: CrudSchemas<Insert, Select, Update>;
      columnName: StringColumnKeys<T>;
    },
  ) =>
  (columnValue: string) =>
    Effect.gen(function* () {
      const records = yield* fromPromise(DBError, () => ({
        message: `fail to select ${args.table} by ${args.columnName} = ${columnValue}`,
        operation: 'select' as const,
        table: args.table,
        params: [args.columnName, columnValue],
      }))(async () => {
        const query = db.selectFrom(args.table).selectAll();
        return await (query as any)
          .where(args.columnName, '=', columnValue)
          .execute();
      });
      if (!records) return [];
      return yield* convertToSchemaObjectWithEffect(
        `${args.schema.tags.entity} Array`,
      )(Schema.Array(args.schema.selectSchema), records);
    });

type RepositoryContext<
  T extends TablesWithId,
  Insert extends Schema.Top,
  Select extends Schema.Top,
  Update extends Schema.Top,
> = {
  db: Kysely<DB>;
  table: T;
  schemas: CrudSchemas<Insert, Select, Update>;
};

export const customSQLAndReturnRecords =
  <
    T extends TablesWithId,
    Insert extends Schema.Top,
    Select extends Schema.Top,
    Update extends Schema.Top,
  >(
    db: Kysely<DB>,
    table: T,
    schema: CrudSchemas<Insert, Select, Update>,
    message?: string,
  ) =>
  (
    f: (ctx: RepositoryContext<T, Insert, Select, Update>) => Promise<unknown>,
    params?: unknown[],
  ): Effect.Effect<
    readonly Select['Type'][],
    DBError | SchemaValidationError,
    Select['DecodingServices']
  > =>
    Effect.gen(function* () {
      const result = yield* fromPromise(DBError, () => ({
        message: message ?? `fail custom query on ${table}`,
        table: table,
        operation: 'select' as const,
        params: params,
      }))(async () => await f({ db, table, schemas: schema }));
      if (!result) return [];
      return yield* convertToSchemaObjectWithEffect(
        `${schema.tags.entity} Array`,
      )(Schema.Array(schema.selectSchema), result);
    });

const selectAllRecords =
  <
    T extends TablesWithId,
    Insert extends Schema.Top,
    Select extends Schema.Top,
    Update extends Schema.Top,
  >(
    db: Kysely<DB>,
    table: T,
    schema: CrudSchemas<Insert, Select, Update>,
  ) =>
  () =>
    Effect.gen(function* () {
      const records = yield* fromPromise(DBError, () => ({
        message: `fail to select all ${table}`,
        table,
        operation: 'select' as const,
      }))(async () => await db.selectFrom(table).selectAll().execute());
      if (!records) return [];
      return yield* convertToSchemaObjectWithEffect(
        `${schema.tags.entity} Array`,
      )(Schema.Array(schema.selectSchema), records);
    });

const prepareForInsert =
  <
    Insert extends Schema.Top,
    Select extends Schema.Top,
    Update extends Schema.Top,
  >(
    schema: CrudSchemas<Insert, Select, Update>,
  ) =>
  (
    data: Schema.Schema.Type<typeof schema.insertSchema>[],
    modifiedBy?: string,
  ) =>
    Effect.gen(function* () {
      if (data.length == 0) return [];
      const encoded = yield* convertFromSchemaObjectWithEffect(
        `${schema.tags.entity} Array`,
      )(Schema.Array(schema.insertSchema), data);
      if (schema.includeAuditFields) {
        if (!modifiedBy)
          return yield* Effect.fail(
            new ValueError({
              message: `modifiedBy is not set for audit table`,
              field: 'modifiedBy',
              cause: modifiedBy,
            }),
          );
        encoded.forEach((item) => {
          (item as any).modified_at = getNewTimestamp();
          (item as any).modified_by = modifiedBy;
        });
      }
      encoded.forEach((item) => {
        (item as any).id = generateUuid7();
      });
      return encoded;
    });
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type CreateRecordsFn<
  Insert extends Schema.Top,
  Select extends Schema.Top,
  Update extends Schema.Top,
  S extends CrudSchemas<Insert, Select, Update>,
> = S extends { includeAuditFields: true }
  ? (
      data: Schema.Schema.Type<S['insertSchema']>[],
      modifiedBy: string,
    ) => Effect.Effect<any, any, any>
  : (
      data: Schema.Schema.Type<S['insertSchema']>[],
      modifiedBy?: string,
    ) => Effect.Effect<
      readonly Select['Type'][],
      ValueError | DBError,
      Select['DecodingServices'] | Insert['EncodingServices']
    >;
const createRecords =
  <
    T extends TablesWithId,
    Insert extends Schema.Top,
    Select extends Schema.Top,
    Update extends Schema.Top,
  >(
    db: Kysely<DB>,
    table: T,
    schema: CrudSchemas<Insert, Select, Update>,
  ) =>
  (
    data: Schema.Schema.Type<typeof schema.insertSchema>[],
    modifiedBy?: string,
  ) =>
    Effect.gen(function* () {
      const encoded = yield* prepareForInsert(schema)(data, modifiedBy);
      if (encoded.length == 0) return [];
      // const encoded = yield* convertFromSchemaObjectWithEffect(
      //   DBError,
      //   `${schema.tags.entity} Array`,
      // )(Schema.Array(schema.insertSchema), data);
      // if (schema.includeAuditFields) {
      //   if (!modifiedBy)
      //     return yield* Effect.fail(
      //       new ValueError(`modifiedBy is not set for audit table`),
      //     );
      //   encoded.forEach((item) => {
      //     (item as any).modified_at = getNewTimestamp();
      //     (item as any).modified_by = modifiedBy;
      //   });
      // }
      // encoded.forEach((item) => {
      //   (item as any).id = generateUuid7();
      // });
      const records = yield* fromPromise(DBError, () => ({
        message: `fail to insert ${table} record`,
        operation: 'insert' as const,
        table,
      }))(async () => {
        return await db.transaction().execute(async (trx) => {
          const insertedRows: Selectable<DB[T]>[] = [];
          for (const patch of encoded) {
            const inserted = await trx
              .insertInto(table)
              .values(patch as Insertable<DB[T]>)
              .outputAll('inserted')
              .executeTakeFirst();
            if (inserted) insertedRows.push(inserted as Selectable<DB[T]>);
          }
          return insertedRows;
        });
      });
      return yield* convertToSchemaObjectWithEffect(
        `${schema.tags.entity} Array`,
      )(Schema.Array(schema.selectSchema), records);
    });

const prepareForUpdate =
  <
    Insert extends Schema.Top,
    Select extends Schema.Top,
    Update extends Schema.Top,
  >(
    schema: CrudSchemas<Insert, Select, Update>,
  ) =>
  (
    data: Schema.Schema.Type<typeof schema.updateSchema>[],
    modifiedBy?: string,
  ) =>
    Effect.gen(function* () {
      if (data.length == 0) return [];
      const encoded = yield* convertFromSchemaObjectWithEffect(
        `${schema.tags.entity} Array`,
      )(Schema.Array(schema.updateSchema), data);
      if (schema.includeAuditFields) {
        if (!modifiedBy)
          return yield* Effect.fail(
            new ValueError({
              message: `modifiedBy is not set for audit table`,
              field: 'modifiedBy',
              cause: modifiedBy,
            }),
          );
        encoded.forEach((item) => {
          (item as any).modified_at = getNewTimestamp();
          (item as any).modified_by = modifiedBy;
        });
      }
      return encoded;
    });
const updateRecords =
  <
    T extends TablesWithId,
    Insert extends Schema.Top,
    Select extends Schema.Top,
    Update extends Schema.Top,
  >(
    db: Kysely<DB>,
    table: T,
    schema: CrudSchemas<Insert, Select, Update>,
  ) =>
  (
    data: Schema.Schema.Type<typeof schema.updateSchema>[],
    modifiedBy?: string,
  ) =>
    Effect.gen(function* () {
      const encoded = yield* prepareForUpdate(schema)(data, modifiedBy);
      if (encoded.length == 0) return [];
      const records = yield* fromPromise(DBError, () => ({
        message: `fail to update ${table} record`,
        operation: 'update' as const,
        table,
      }))(async () => {
        return await db.transaction().execute(async (trx) => {
          const updatedRows: Selectable<DB[T]>[] = [];
          for (const patch of encoded as Array<{ id: string }>) {
            const { id, ...data } = patch;
            const query = trx.updateTable(table) as any;
            const updated = await query
              .set(data)
              .where('id', '=', id)
              .outputAll('inserted')
              .executeTakeFirst();
            if (updated) updatedRows.push(updated as Selectable<DB[T]>);
          }
          return updatedRows;
        });
      });
      return yield* convertToSchemaObjectWithEffect(
        `${schema.tags.entity} Array`,
      )(Schema.Array(schema.selectSchema), records);
    });
export const makeCustomUpdate =
  <
    T extends TablesWithId,
    Insert extends Schema.Top,
    Select extends Schema.Top,
    Update extends Schema.Top,
  >(
    db: Kysely<DB>,
    table: T,
    schema: CrudSchemas<Insert, Select, Update>,
  ) =>
  (
    f: (
      ctx: RepositoryContext<T, Insert, Select, Update>,
    ) => Promise<UpdateResult[]>,
    message?: string,
  ): Effect.Effect<number, DBError> =>
    Effect.gen(function* () {
      const result = yield* fromPromise(DBError, () => ({
        message: message ?? `fail custom update on ${table}`,
        table,
        operation: 'update' as const,
      }))(async () => await f({ db, table, schemas: schema }));
      return result
        .map((r) => r.numUpdatedRows)
        .reduce((prev, current) => prev + Number(current), 0);
    });
export const makeCustomDelete =
  <
    T extends TablesWithId,
    Insert extends Schema.Top,
    Select extends Schema.Top,
    Update extends Schema.Top,
  >(
    db: Kysely<DB>,
    table: T,
    schema: CrudSchemas<Insert, Select, Update>,
  ) =>
  (
    f: (
      ctx: RepositoryContext<T, Insert, Select, Update>,
    ) => Promise<DeleteResult[]>,
    message?: string,
  ): Effect.Effect<number, DBError> =>
    Effect.gen(function* () {
      const result = yield* fromPromise(DBError, () => ({
        message: message ?? `fail custom delete on ${table}`,
        table,
        operation: 'delete' as const,
      }))(async () => await f({ db, table, schemas: schema }));
      if (!result || result.length == 0) return 0;
      return result
        .map((r) => Number(r.numDeletedRows) ?? 0)
        .reduce((prev, current) => prev + current, 0);
    });

const deleteRecords =
  <T extends TablesWithId>(db: Kysely<DB>, table: T) =>
  (ids: string[]) =>
    Effect.gen(function* () {
      if (ids.length == 0 || !ids) {
        return 0;
      }
      const result = yield* fromPromise(DBError, () => ({
        message: `fail to delete ${table} by ids = ${ids.join(',')}`,
        table,
        params: ids,
        operation: 'delete' as const,
      }))(
        async () =>
          (await (db.deleteFrom(table) as any)
            .where('id', 'in', ids)
            .execute()) as DeleteResult[],
      );
      return result
        .map((r) => r.numDeletedRows)
        .reduce((prev, current) => prev + Number(current), 0);
    });

const syncRecords =
  <
    T extends TablesWithId,
    Insert extends Schema.Top,
    Select extends Schema.Top,
    Update extends Schema.Top,
  >(
    db: Kysely<DB>,
    table: T,
    schema: CrudSchemas<Insert, Select, Update>,
  ) =>
  <
    TInsert extends Schema.Schema.Type<typeof schema.insertSchema>,
    TSelect extends Readonly<TInsert> &
      Readonly<{
        id: string;
      }> & { [field: string]: any },
    TUpdate extends Schema.Schema.Type<typeof schema.updateSchema>,
    TField extends keyof (TInsert | TUpdate),
  >(args: {
    diffResult: {
      inserts: TInsert[];
      updates: {
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
  }) => {
    const { diffResult, modifiedBy, deleteRequired } = args;

    return Effect.gen(function* () {
      const encodedCreateRecord = yield* prepareForInsert(schema)(
        diffResult.inserts,
        modifiedBy,
      );

      const encodedUpdateRecord = yield* prepareForUpdate(schema)(
        diffResult.updates.map((u) => u.incoming),
        modifiedBy,
      );
      const tobeDeletedIds = !deleteRequired
        ? []
        : diffResult.deletes.map((d) => d.id);
      const result = yield* fromPromise(DBError, () => ({
        message: `fail to sync ${table} record`,
        table,
        params: args.diffResult,
        operation: 'custom' as const,
      }))(async () => {
        return await db.transaction().execute(async (trx) => {
          const insertedRows: Selectable<DB[T]>[] = [];
          for (const patch of encodedCreateRecord) {
            const inserted = await trx
              .insertInto(table)
              .values(patch as Insertable<DB[T]>)
              .outputAll('inserted')
              .executeTakeFirst();
            if (inserted) insertedRows.push(inserted as Selectable<DB[T]>);
          }
          // const insertedRows: Selectable<DB[T]>[] = await trx
          //   .insertInto(table)
          //   .values(encodedCreateRecord as Insertable<DB[T]>[])
          //   .returningAll()
          //   .execute();
          const updatedRows: Selectable<DB[T]>[] = [];
          for (const patch of encodedUpdateRecord as Array<{ id: string }>) {
            const { id, ...data } = patch;
            const query = trx.updateTable(table) as any;
            const updated = await query
              .set(data)
              .where('id', '=', id)
              .outputAll('inserted')
              .executeTakeFirst();
            if (updated) updatedRows.push(updated as Selectable<DB[T]>);
          }
          let deletedCount: number = 0;
          if (tobeDeletedIds.length == 0 || !tobeDeletedIds) {
            deletedCount = 0;
          } else {
            const deletedResult = (await (trx.deleteFrom(table) as any)
              .where('id', 'in', tobeDeletedIds)
              .execute()) as DeleteResult[];
            deletedCount = deletedResult
              .map((r) => r.numDeletedRows)
              .reduce((prev, current) => prev + Number(current), 0);
          }

          return { insertedRows, updatedRows, deletedCount };
        });
      });

      const insertedRows = yield* convertToSchemaObjectWithEffect(
        `${schema.tags.entity} Array`,
      )(Schema.Array(schema.selectSchema), result.insertedRows);
      const updatedRows = yield* convertToSchemaObjectWithEffect(
        `${schema.tags.entity} Array`,
      )(Schema.Array(schema.selectSchema), result.updatedRows);
      return { insertedRows, updatedRows, deletedCount: result.deletedCount };
    });
  };

type RepositoryFromOptions<
  Insert extends Schema.Top,
  Select extends Schema.Top,
  Update extends Schema.Top,
  TFindAll extends boolean | undefined,
  TColumn extends string | undefined,
  MethodName extends string,
  TExt extends object,
> = CrudRepository<Insert, Select, Update> &
  (TFindAll extends true ? WithFindAll<Select> : object) &
  (TColumn extends string
    ? WithFindByColumn<Select, TColumn, MethodName>
    : object) &
  TExt;

type RepositoryExtensions<
  T extends TablesWithId,
  Insert extends Schema.Top,
  Select extends Schema.Top,
  Update extends Schema.Top,
  TEnv,
> = (ctx: {
  db: Kysely<DB>;
  table: T;
  schemas: CrudSchemas<Insert, Select, Update>;
}) => Record<
  string,
  (...args: any[]) => Effect.Effect<any, DBError | SchemaValidationError, TEnv>
>;

export const makeRepositoryFromDb = <
  const T extends TablesWithId,
  Insert extends Schema.Top,
  Select extends Schema.Top,
  Update extends Schema.Top,
  const TFindAll extends boolean | undefined = undefined,
  const TColumn extends string | undefined = undefined,
  const TMethodName extends string = string,
  const TExt extends object = object,
>(
  db: Kysely<DB>,
  params: {
    readonly table: T;
    readonly schemas: CrudSchemas<Insert, Select, Update>;
    readonly options?: {
      readonly findAll?: TFindAll;
      readonly findByColumn?: {
        methodName: TMethodName;
        columnName: StringColumnKeys<T>;
      };
    };
  },
  extensions?: RepositoryExtensions<T, Insert, Select, Update, any>,
) => {
  const base = {
    create: createRecords(db, params.table, params.schemas),
    findById: selectRecordById(db, params.table, params.schemas),
    updateRecords: updateRecords(db, params.table, params.schemas),
    deleteRecords: deleteRecords(db, params.table),
    synchronizeRecords: syncRecords(db, params.table, params.schemas),
  };

  const ext = extensions
    ? extensions({ db, table: params.table, schemas: params.schemas })
    : {};

  const withFindAll =
    params.options?.findAll == true
      ? { findAll: selectAllRecords(db, params.table, params.schemas) }
      : {};

  const withFindByColumn = params.options?.findByColumn
    ? {
        [params.options.findByColumn.methodName]: selectRecordsByColumn(db, {
          table: params.table,
          schema: params.schemas,
          columnName: params.options.findByColumn.columnName,
        }),
      }
    : {};

  return {
    ...base,
    ...withFindAll,
    ...withFindByColumn,
    ...ext,
  } as RepositoryFromOptions<
    Insert,
    Select,
    Update,
    TFindAll,
    TColumn,
    TMethodName,
    TExt
  >;
};
