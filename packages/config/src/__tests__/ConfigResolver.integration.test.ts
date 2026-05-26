import { fileURLToPath } from 'node:url'
import { ConfigLayer, MainLayer, PlatformLayer } from '@gyomu/infra'
import { Config, Effect, Layer, Schema } from 'effect'
import { describe, expect, it } from 'vitest'
import { makeRunner } from '@gyomu/schema/effect'
import { ConfigResolver, ConfigResolverLive } from '../ConfigResolver.js'
import { ConfigRootDirectory } from '../services/ConfigRootDirectory.js'
import type { ConfigRequest } from '../types/ConfigRequest.js'
import type { ConfigQuery } from '../ConfigQuery.js'
import type { StaticResolutionMode } from '../types/ConfigResolutionMode.js'

const ConfigSchema = Schema.Struct({
  host: Schema.String,
  port: Schema.optional(Schema.Number),
  logLevel: Schema.optional(Schema.String),
  timeout: Schema.optional(Schema.Number),

  features: Schema.optional(
    Schema.Struct({
      audit: Schema.optional(Schema.Boolean),
      beta: Schema.optional(Schema.Boolean),
      featureA: Schema.optional(Schema.Boolean),
    }),
  ),

  database: Schema.optional(
    Schema.Struct({
      host: Schema.optional(Schema.String),
      port: Schema.optional(Schema.Number),
    }),
  ),
})

type RawLoadedConfig = Partial<{
  host: string
  port: number
  logLevel: string
  timeout: number
  features: { audit: boolean; beta: boolean }
  database: { host: string; port: number }
}>

const rawLoadedConfig = Config.all({
  host: Config.option(Config.string()),
  port: Config.option(Config.number()),
  logLevel: Config.option(Config.string()),
  timeout: Config.option(Config.number()),
  features: Config.option(
    Config.all({
      audit: Config.boolean(),
      beta: Config.boolean(),
    }),
  ),
  database: Config.option(
    Config.all({
      host: Config.string(),
      port: Config.number(),
    }),
  ),
})

const fixtureRoot = fileURLToPath(new URL('../../test-fixtures/config', import.meta.url))

const ConfigRootDirectoryTestLayer = Layer.succeed(ConfigRootDirectory, {
  get: () => Effect.succeed(fixtureRoot),
})
const TestLayer = Layer.mergeAll(
  MainLayer,
  ConfigLayer,
  ConfigRootDirectoryTestLayer,
  ConfigResolverLive,
)
  .pipe(Layer.provideMerge(ConfigRootDirectoryTestLayer))
  .pipe(Layer.provideMerge(ConfigLayer))
  .pipe(Layer.provideMerge(PlatformLayer))
const runner = makeRunner(TestLayer)

const createRequest = (
  query: ConfigQuery,
  resolutionMode: StaticResolutionMode,
): ConfigRequest<typeof ConfigSchema, RawLoadedConfig> => ({
  defaultConfig: {
    host: 'dummy',
  },
  query,
  schema: ConfigSchema,
  rawConfig: rawLoadedConfig,
  resolutionMode,
})
const program = (query: ConfigQuery, resolutionMode: StaticResolutionMode) =>
  Effect.gen(function* () {
    const configResolver = yield* ConfigResolver
    return yield* configResolver.get(createRequest(query, resolutionMode))
  })
describe('ConfigResolver Integration Test', () => {
  it('Global + Group + Function', async () => {
    const result = await runner(program({ scope: 'sales', function: 'invoice' }, 'file'))
    console.log(JSON.stringify(result, null, 2))
    expect(result).toMatchObject({
      host: 'global-sales-invoice',
      port: 3000,
      logLevel: 'info',
      timeout: 3000,

      features: {
        audit: false,
        beta: false,
      },

      database: {
        host: 'global-db',
        port: 5432,
      },
    })
  })
})
