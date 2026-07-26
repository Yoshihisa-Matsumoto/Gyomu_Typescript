import { defineEntityCrudSchemas, schemaField } from '@gyomu/schema/entity'
import { Context, Schema } from 'effect'
import type { GyomuError } from '@gyomu/schema'
import type { EntityDefinition } from '@gyomu/schema/entity'
import type { Effect } from 'effect'

/**
 * Defines the service interface for managing prompt definitions and versions.
 */
export interface PromptRepositoryService {
  /**
   * Retrieves a prompt definition by its key.
   *
   * @param key The unique key of the prompt definition.
   *
   * @returns An effect yielding the prompt definition if found, or undefined.
   */
  getByKey: (key: string) => Effect.Effect<PromptDefinition | undefined, GyomuError, any>

  /**
   * Retrieves a specific version of a prompt definition.
   *
   * @param key The unique key of the prompt definition.
   *
   * @param version The version number to retrieve.
   *
   * @returns An effect yielding the prompt version if found, or undefined.
   */
  getVersion: (
    key: string,
    version: number,
  ) => Effect.Effect<PromptVersion | undefined, GyomuError, any>

  /**
   * Saves a new draft prompt.
   *
   * @param prompt The prompt content to save as a draft.
   *
   * @returns An effect representing the completion of the operation.
   */
  saveDraft: (prompt: string) => Effect.Effect<void>

  /**
   * Publishes a specific version of a prompt definition.
   *
   * @param key The unique key of the prompt definition.
   *
   * @param version The version number to publish.
   *
   * @returns An effect representing the completion of the operation.
   */
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

/**
 * CRUD schemas for prompt versions.
 */
export const PromptVersionSchemas = defineEntityCrudSchemas(PromptVersionSchemaEntry)

/**
 * Defines the structure of a prompt version.
 */
export const PromptVersionSchema = Schema.Struct(PromptVersionFields)

/**
 * Represents the data structure of a versioned prompt.
 */
export type PromptVersion = Schema.Schema.Type<typeof PromptVersionSchema>

/**
 * The dependency injection service for prompt repositories.
 */
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

/**
 * CRUD schemas for prompt definitions.
 */
export const PromptDefinitionSchemas = defineEntityCrudSchemas(PromptDefinitionSchemaEntry)

/**
 * Defines the structure of a prompt definition, including its associated versions.
 */
export const PromptDefinitionSchema = Schema.Struct({
  ...PromptDefinitionFields,
  versions: Schema.Array(PromptVersionSchema),
})

/**
 * Represents the core definition of a prompt containing metadata and version history.
 */
export type PromptDefinition = Schema.Schema.Type<typeof PromptDefinitionSchema>
