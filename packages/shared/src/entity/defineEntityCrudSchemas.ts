import { Schema } from 'effect';
import {
  EntityDefinition,
  Fields,
  Mutable,
  Optionalized,
  UIAnnotations,
} from './type.js';
import { PrimaryFields, AuditFields } from './fields.js';

const pickFields = <T extends Fields, K extends readonly (keyof T)[]>(
  fields: T,
): Pick<T, K[number]> => {
  const keys: K = Object.keys(fields) as any as K;
  const result = {} as Pick<T, K[number]>;
  for (const key of keys) {
    result[key] = fields[key];
  }
  return result;
};

const optionalizeFields = <T extends Fields>(fields: T): Optionalized<T> => {
  const result = {} as Optionalized<T>;
  for (const key in fields) {
    result[key] = Schema.optional(fields[key]);
  }
  return result;
};
export const defineEntityCrudSchemas = <
  TFields extends Fields,
  TIncludeAudit extends boolean,
  TUI = UIAnnotations<TFields>,
>(
  args: EntityDefinition<TFields, TIncludeAudit>,
) => {
  const selectFields = {
    ...PrimaryFields,
    ...args.fields,
  };
  const selectFieldsWithAudit = {
    ...PrimaryFields,
    ...args.fields,
    ...AuditFields,
  };
  const effectiveSelectSchema = (
    args.options?.includeAudit ? selectFieldsWithAudit : selectFields
  ) as TIncludeAudit extends true
    ? typeof selectFieldsWithAudit
    : typeof selectFields;

  const updateKeys = Object.keys(args.fields);
  const insertFields = args.fields;
  const updateFields = {
    ...PrimaryFields,
    ...optionalizeFields(pickFields(args.fields)),
  };

  const auditKey = { modifiedAt: 'modified_at', modifiedBy: 'modified_by' };
  const mappingKeys = {
    ...(args.options?.keyMapping ?? {}),
    ...(args.options?.includeAudit ? auditKey : {}),
  };
  const numOfMappingKey = Object.keys(mappingKeys).length;

  const selectSchema =
    numOfMappingKey == 0
      ? Schema.Struct(effectiveSelectSchema)
      : Schema.Struct(effectiveSelectSchema).pipe(
          Schema.encodeKeys(mappingKeys),
        );
  const insertSchema =
    numOfMappingKey == 0
      ? Schema.Struct(insertFields)
      : Schema.Struct(insertFields).pipe(Schema.encodeKeys(mappingKeys));
  const updateSchema =
    numOfMappingKey == 0
      ? Schema.Struct(updateFields)
      : Schema.Struct(updateFields).pipe(Schema.encodeKeys(mappingKeys));

  return {
    selectSchema,
    insertSchema,
    updateSchema,
    types: undefined as unknown as {
      _select: Schema.Schema.Type<typeof selectSchema>;
      _insert: Mutable<Schema.Schema.Type<typeof insertSchema>>;
      _update: Mutable<Schema.Schema.Type<typeof updateSchema>>;
    },
    updatefieldNames: updateKeys,
    includeAuditFields: args.options?.includeAudit ?? false,
    fields: args.fields,
    tags: args.tags,
    ui: args.ui,
  };
};
