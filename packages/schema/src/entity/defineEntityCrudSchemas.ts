import { Schema } from 'effect'
import { mapValues } from '../shared/collection/mapValues.js'
import { AuditFields, PrimaryFields } from './fields.js'
import type {
  EntityDefinition,
  Fields,
  Optionalized,
  UIAnnotationField,
  UIAnnotations,
} from './type.js'
import type { Mutable } from 'effect/Types'

const pickFields = <T extends Fields, K extends ReadonlyArray<keyof T>>(
  fields: T,
): Pick<T, K[number]> => {
  const keys: K = Object.keys(fields) as any as K
  const result = {} as Pick<T, K[number]>
  for (const key of keys) {
    result[key] = fields[key]
  }
  return result
}

const optionalizeFields = <T extends Fields>(fields: T): Optionalized<T> =>
  mapValues(fields, (v) => Schema.optional(v))

const PrimaryFieldsUIAnnotation: { [field: string]: UIAnnotationField } = {
  id: {
    widget: 'text',
    label: 'ID',
    readonly: true,
  },
}
const AuditFieldsUIAnnotation: { [field: string]: UIAnnotationField } = {
  modifiedAt: {
    widget: 'text',
    label: 'Update Time',
    readonly: true,
  },
  modifiedBy: {
    widget: 'text',
    label: 'Updated By',
    readonly: true,
  },
}

/**
 * Generates a suite of CRUD schemas (select, insert, update) for a defined entity, optionally including audit fields and key mappings.
 *
 * @param args The configuration object defining entity fields, audit options, field mappings, and UI annotations.
 *
 * @returns An object containing the generated CRUD schemas, a type placeholder for internal inference, a list of updateable field names, and the configuration metadata.
 */
export const defineEntityCrudSchemas = <
  TFields extends Fields,
  TIncludeAudit extends boolean,
  TUI = UIAnnotations<TFields>,
>(
  args: EntityDefinition<TFields, TIncludeAudit, TUI>,
) => {
  const selectFields = {
    ...PrimaryFields,
    ...args.fields,
  }
  const selectFieldsWithAudit = {
    ...PrimaryFields,
    ...args.fields,
    ...AuditFields,
  }
  const effectiveSelectSchema = (
    args.options?.includeAudit ? selectFieldsWithAudit : selectFields
  ) as TIncludeAudit extends true ? typeof selectFieldsWithAudit : typeof selectFields

  const updateKeys = Object.keys(args.fields)
  const insertFields = args.fields
  const updateFields = {
    ...PrimaryFields,
    ...optionalizeFields(pickFields(args.fields)),
  }

  const auditKey = { modifiedAt: 'modified_at', modifiedBy: 'modified_by' }
  const mappingKeys = {
    ...(args.options?.keyMapping ?? {}),
    ...(args.options?.includeAudit ? auditKey : {}),
  }
  const numOfMappingKey = Object.keys(mappingKeys).length

  const selectSchema =
    numOfMappingKey == 0
      ? Schema.Struct(effectiveSelectSchema)
      : Schema.Struct(effectiveSelectSchema).pipe(Schema.encodeKeys(mappingKeys))
  const insertSchema =
    numOfMappingKey == 0
      ? Schema.Struct(insertFields)
      : Schema.Struct(insertFields).pipe(Schema.encodeKeys(mappingKeys))
  const updateSchema =
    numOfMappingKey == 0
      ? Schema.Struct(updateFields)
      : Schema.Struct(updateFields).pipe(Schema.encodeKeys(mappingKeys))

  return {
    selectSchema,
    insertSchema,
    updateSchema,
    types: undefined as unknown as {
      _select: Schema.Schema.Type<typeof selectSchema>
      _insert: Mutable<Schema.Schema.Type<typeof insertSchema>>
      _update: Mutable<Schema.Schema.Type<typeof updateSchema>>
    },
    updatefieldNames: updateKeys,
    includeAuditFields: args.options?.includeAudit ?? false,
    fields: args.fields,
    tags: args.tags,
    ...(args.ui ? { ui: args.ui } : {}),
  }
}
