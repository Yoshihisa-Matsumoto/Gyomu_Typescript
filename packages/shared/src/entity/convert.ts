import { Effect, Schema, Result } from 'effect';
import { SchemaError } from 'effect/Schema';
import { SchemaValidationError } from '../error/SchemaValidationError.js';
import { CrudSchemaType, Fields } from './type.js';
import { AST } from 'effect/SchemaAST';
import { schema } from 'effect/Config';

export const jsonString2SchemaObjectWithoutEffect = <
  S extends Schema.Schema<any>,
>(
  schema: S,
  content: string,
) =>
  Schema.decodeUnknownSync(
    schema as unknown as Schema.Decoder<Schema.Schema.Type<S>, never>,
  )(JSON.parse(content));

export const convertToSchemaObjectWithResult = <S extends Schema.Schema<any>>(
  schema: S,
  input: unknown,
  includeAllErrors: boolean = false,
) => {
  return Schema.decodeUnknownResult(Schema.toType(schema))(
    input,
    includeAllErrors ? { errors: 'all' } : {},
  );
};

export const convertToSchemaObjectWithEffect =
  (schemaName: string) =>
  <S extends Schema.Schema<any>>(schema: S, input: unknown) =>
    Schema.decodeUnknownEffect(schema)(input).pipe(
      Effect.mapError(
        (e: SchemaError) =>
          new SchemaValidationError({
            message: `Failed to decode`,
            cause: e,
            schemaName,
            phase: 'decode',
            issues: e, // ← 生の情報を保持
          }),
      ),
    );

export const convertFromSchemaObjectWithEffect =
  (schemaName: string) =>
  <S extends Schema.Schema<any>>(schema: S, input: S['Type']) =>
    Schema.encodeEffect(schema)(input).pipe(
      Effect.mapError(
        (e: SchemaError) =>
          new SchemaValidationError({
            message: `Failed to encode`,
            cause: e,
            schemaName,
            phase: 'encode',
            issues: e,
          }),
      ),
    );
