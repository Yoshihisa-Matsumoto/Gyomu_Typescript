import type { Schema } from 'effect'
import type { CrudSchemas } from './types.js'

/**
 * Calculates the differences between incoming data records and existing records to determine required insert, update, and delete operations.
 *
 * @param schemas The schemas defining the CRUD operations and field names.
 *
 * @param args An object containing the incoming records, existing records, and a function to extract the unique record key.
 *
 * @returns An object containing arrays of records to be inserted, updated (with field change details), deleted, or those that remained unchanged.
 */
export const diffEntities =
  <Insert extends Schema.Top, Select extends Schema.Top, Update extends Schema.Top>(
    schemas: CrudSchemas<Insert, Select, Update>,
  ) =>
  <
    TInsert extends Schema.Schema.Type<typeof schemas.insertSchema> & {
      [field: string]: any
    },
    TSelect extends Schema.Schema.Type<typeof schemas.selectSchema> & {
      id: string
    } & { [field: string]: any },
    TUpdate extends Schema.Schema.Type<typeof schemas.updateSchema> & {
      [field: string]: any
    },
    TField extends keyof (TInsert | TUpdate | TSelect),
  >(args: {
    incoming: Array<TInsert | TUpdate>
    existing: ReadonlyArray<TSelect>
    getKey: (
      v: Schema.Schema.Type<
        typeof schemas.insertSchema | typeof schemas.updateSchema | typeof schemas.selectSchema
      >,
    ) => string
  }) => {
    const { incoming, existing, getKey } = args
    const updateFieldNames: Array<TField> = schemas.updatefieldNames as Array<TField>

    const existingMap = new Map<string, TSelect>(
      existing.map((record) => {
        return [getKey(record), record]
      }),
    )

    const seenIds = new Set<string>()

    const inserts: Array<TInsert> = []
    const updates: Array<{
      id: string
      existing: TSelect
      incoming: TUpdate
      changedFields: Array<TField>
      changedValues: Partial<Pick<TUpdate, TField>>
    }> = []
    const deletes: Array<TSelect> = []
    const unchanged: Array<{
      id: string
      existing: TSelect
      incoming: TInsert | TUpdate
    }> = []

    for (const record of incoming) {
      const recordId = getKey(record)
      const current = existingMap.get(recordId)
      if (!current) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        inserts.push(record as TInsert)
        continue
      }
      const currentRecordId = current.id
      seenIds.add(recordId)

      const changedFields: Array<TField> = []
      const changedValues: Partial<Pick<TUpdate, TField>> = {}

      for (const field of updateFieldNames) {
        if (record[field] === undefined) continue
        if (!Object.is(record[field], current[field])) {
          changedFields.push(field)
          changedValues[field] = record[field]
        }
      }

      if (changedFields.length === 0) {
        unchanged.push({
          id: recordId,
          existing: current,
          incoming: { ...record, id: currentRecordId },
        })
        continue
      }

      updates.push({
        id: recordId,
        existing: current,
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        incoming: { ...record, id: currentRecordId } as TUpdate,
        changedFields,
        changedValues: { id: currentRecordId, ...changedValues },
      })
    }

    for (const record of existing) {
      const recordId = getKey(record)
      if (!seenIds.has(recordId)) deletes.push(record)
    }

    return {
      inserts,
      updates,
      deletes,
      unchanged,
    }
  }
