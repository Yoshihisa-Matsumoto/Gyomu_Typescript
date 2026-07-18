import { join } from 'node:path'
import { convertToSchemaObjectWithEffect, schemaField } from '@gyomu/schema/entity'
import { Config, Effect, Layer, Option, Schema } from 'effect'
import { ConfigService } from '@gyomu/infra'
import { GyomuError, wrapInfraError } from '@gyomu/schema'
import { getFileStat, readYamlFromFile } from '@gyomu/infra/fs'
import { PromptRepository } from './PromptRepositoryService.js'
import type { ConfigError } from '@gyomu/schema'
import type {
  PromptDefinition,
  PromptRepositoryService,
  PromptVersion,
} from './PromptRepositoryService.js'
import type { FileSystem } from 'effect'

const PromptFileSchema = Schema.Struct({
  key: Schema.String,
  description: schemaField.optionalText(),
  activeVersion: schemaField.int(),
  versions: Schema.Array(
    Schema.Struct({
      version: schemaField.int(),
      content: schemaField.text(),
      changeNote: schemaField.optionalText(),
    }),
  ),
})

type PromptFileType = Schema.Schema.Type<typeof PromptFileSchema>

const FilePromptRepositoryService: PromptRepositoryService = {
  getByKey: (key: string) =>
    Effect.gen(function* () {
      const result = yield* loadPromptFileType(key)
      return PromptFileType2PromptDefinition(result.createdAt, result.promptFile)
    }),
  getVersion: (key: string, version: number) =>
    Effect.gen(function* () {
      const result = yield* loadPromptFileType(key)
      return getPromptVersion(result, version)
    }),
  // eslint-disable-next-line unused-imports/no-unused-vars
  saveDraft: (prompt: string) => Effect.succeed(undefined),
  // eslint-disable-next-line unused-imports/no-unused-vars
  publish: (key: string, version: number) => Effect.succeed(undefined),
}

export const getPromptVersion = (
  fileResult: {
    createdAt: string
    promptFile: PromptFileType
  },
  version: number,
): PromptVersion | undefined => {
  const versionData = fileResult.promptFile.versions.find((v) => v.version === version)
  if (!versionData) return undefined
  return {
    content: versionData.content,
    version: versionData.version,
    changeNote: versionData.changeNote,
    createdAt: fileResult.createdAt,
    createdBy: '',
    id: '',
    promptId: '',
  }
}

export const loadPromptFileType = (key: string) =>
  Effect.gen(function* () {
    const promptRootDirectory = yield* getPromptRepository()
    const filePath = join(promptRootDirectory, `${key}.yaml`)
    const createResult = Option.getOrThrow((yield* getFileStat(filePath)).birthtime)
    const result = yield* convertToSchemaObjectWithEffect('PromptFileSchema')(
      PromptFileSchema,
      readYamlFromFile(filePath),
    )

    return { promptFile: result, createdAt: createResult.toISOString() }
  }).pipe(
    Effect.mapError((e) =>
      wrapInfraError(GyomuError, e, () => ({
        message: 'fail to load prompt file',
        details: key,
        domain: 'AI Prompt Repository',
      })),
    ),
  )

export const FilePromptRepositoryLayer = Layer.succeed(
  PromptRepository,
  FilePromptRepositoryService,
)

const PromptFileType2PromptDefinition = (
  createTime: string,
  file: PromptFileType,
): PromptDefinition => {
  return {
    id: '',
    activeVersion: file.activeVersion,
    createdAt: createTime,
    description: file.description,
    key: file.key,
    versions: file.versions.map((v) => ({
      content: v.content,
      version: v.version,
      changeNote: v.changeNote,
      createdAt: createTime,
      createdBy: '',
      id: '',
      promptId: '',
    })),
  }
}

const FilePromptRepositoryConfig = Config.all({
  promptRootDirectory: Config.withDefault(Config.string(`PROMPT_ROOT_DIR`), './prompt'),
})
const getPromptRepository = (): Effect.Effect<
  string,
  ConfigError,
  ConfigService | FileSystem.FileSystem
> =>
  Effect.gen(function* () {
    const service = yield* ConfigService
    const result = yield* service.load(FilePromptRepositoryConfig)
    return result.promptRootDirectory
  })
