import { defineEntityCrudSchemas, schemaField } from '@gyomu/schema/entity'
import { Context, Schema } from 'effect'
import type { GyomuError } from '@gyomu/schema'
import type { EntityDefinition } from '@gyomu/schema/entity'
import type { Effect } from 'effect'

export interface PromptRepositoryService {
  getByKey: (key: string) => Effect.Effect<PromptDefinition | undefined, GyomuError, any>
  getVersion: (
    key: string,
    version: number,
  ) => Effect.Effect<PromptVersion | undefined, GyomuError, any>
  saveDraft: (prompt: string) => Effect.Effect<void>
  publish: (key: string, version: number) => Effect.Effect<void>
}

const PromptVersionFields = {
  id: schemaField.id,
  promptId: schemaField.id,
  version: schemaField.int(),
  content: schemaField.text(),
  changeNote: schemaField.optionalText(),
  createdAt: schemaField.timestampString,
  createdBy: schemaField.text({ maxLength: 100 }),
}

const PromptVersionSchemaEntry: EntityDefinition<typeof PromptVersionFields, false> = {
  fields: PromptVersionFields,
  tags: {
    entity: 'PromptVersion',
  },
}

export const PromptVersionSchemas = defineEntityCrudSchemas(PromptVersionSchemaEntry)

export const PromptVersionSchema = Schema.Struct(PromptVersionFields)

export type PromptVersion = Schema.Schema.Type<typeof PromptVersionSchema>

export class PromptRepository extends Context.Service<PromptRepository, PromptRepositoryService>()(
  'PromptRepository',
) {}

const PromptDefinitionFields = {
  id: schemaField.id,
  key: schemaField.text(),
  description: schemaField.optionalText(),
  activeVersion: schemaField.int(),
  createdAt: schemaField.timestampString,
}

const PromptDefinitionSchemaEntry: EntityDefinition<typeof PromptDefinitionFields, false> = {
  fields: PromptDefinitionFields,
  tags: {
    entity: 'PromptDefinition',
  },
}
export const PromptDefinitionSchemas = defineEntityCrudSchemas(PromptDefinitionSchemaEntry)

export const PromptDefinitionSchema = Schema.Struct({
  ...PromptDefinitionFields,
  versions: Schema.Array(PromptVersionSchema),
})

export type PromptDefinition = Schema.Schema.Type<typeof PromptDefinitionSchema>
