import { Schema, SchemaTransformation } from 'effect';
import { LocalDateSchema } from './date.js';
import { defineEntityCrudSchemas } from './defineEntityCrudSchemas.js';

export type Fields = Record<string, Schema.Schema<any>>;
export type EntityDefinition<
  TFields extends Fields,
  TIncludeAudit extends boolean,
> = {
  fields: TFields;
  tags: {
    entity: string;
    sensitiveFields?: readonly Extract<keyof TFields, string>[];
  };
  options?: {
    includeAudit?: TIncludeAudit;
    keyMapping?: { readonly [K in keyof TFields]?: PropertyKey };
  };
};

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

export type Optionalized<T extends Fields> = {
  [K in keyof T]: ReturnType<typeof Schema.optional<T[K]>>;
};

export type CrudSchemaGeneratorType<
  TFields extends Fields,
  TIncludeAudit extends boolean,
> = ReturnType<typeof defineEntityCrudSchemas<TFields, TIncludeAudit>>;
