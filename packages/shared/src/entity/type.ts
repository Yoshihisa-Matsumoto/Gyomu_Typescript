import { Schema, SchemaTransformation } from 'effect';
import { LocalDateSchema } from './date.js';
import { defineEntityCrudSchemas } from './defineEntityCrudSchemas.js';

export type Fields = Record<string, Schema.Schema<any>>;
export type EntityDefinition<
  TFields extends Fields,
  TIncludeAudit extends boolean,
  TUI = UIAnnotations<TFields>,
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
  ui?: TUI;
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

export type UIAnnotation = {
  widget?: 'text' | 'textarea' | 'select' | 'date' | 'number';
  label?: string;
  placeholder?: string;
  readonly?: boolean;

  format?: 'email' | 'password' | 'phone';
  visible?: boolean;
  order?: number;
};
export type UIAnnotationField =
  | UIAnnotation
  | {
      default?: UIAnnotation;
      view?: UIAnnotation;
      update?: UIAnnotation;
      create?: UIAnnotation;
    };
export type UIAnnotations<TFields> = Partial<{
  [K in keyof TFields]?: UIAnnotationField;
}>;
