import { fileURLToPath } from 'node:url'
import { ConfigLayer, MainLayer, PlatformLayer } from '@gyomu/infra'
import { Config, Effect, Layer, Schema } from 'effect'
import { describe, expect, it } from 'vitest'
import { makeRunner } from '@gyomu/schema/effect'
import { ConfigResolver, ConfigResolverLive } from '../ConfigResolver.js'
import { ConfigRootDirectory } from '../services/ConfigRootDirectory.js'
import type { ConfigRequest } from '../types/ConfigRequest.js'
import type { ConfigQuery } from '../ConfigQuery.js'
import type { AppConfig } from '../types/AppConfig.js'

const ConfigSchema = Schema.Struct({
  host: Schema.String,
  port: Schema.optional(Schema.Number),
  logLevel: Schema.optional(Schema.String),
  timeout: Schema.optional(Schema.Number),

  features: Schema.optional(
    Schema.Struct({
      audit: Schema.optional(Schema.Boolean),
      beta: Schema.optional(Schema.Boolean),
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
  host: Config.option(Config.string('host')),
  port: Config.option(Config.number('port')),
  logLevel: Config.option(Config.string('logLevel')),
  timeout: Config.option(Config.number('timeout')),
  features: Config.option(
    Config.nested(
      Config.all({
        audit: Config.boolean('audit'),
        beta: Config.boolean('beta'),
      }),
      'features',
    ),
  ),
  database: Config.option(
    Config.nested(
      Config.all({
        host: Config.string('host'),
        port: Config.number('port'),
      }),
      'database',
    ),
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
): ConfigRequest<typeof ConfigSchema, typeof rawLoadedConfig> => ({
  defaultConfig: {
    host: 'dummy',
  },
  query,
  schema: ConfigSchema,
  rawConfig: rawLoadedConfig,
  resolutionMode: 'file',
})
const program = (query: ConfigQuery) =>
  Effect.gen(function* () {
    const configResolver = yield* ConfigResolver
    return yield* configResolver.get(createRequest(query))
  })

const createRequestWithMix = (
  query: ConfigQuery,
  payload: Partial<AppConfig<typeof ConfigSchema>>,
): ConfigRequest<typeof ConfigSchema, typeof rawLoadedConfig> => ({
  defaultConfig: {
    host: 'dummy',
  },
  query,
  schema: ConfigSchema,
  rawConfig: rawLoadedConfig,
  resolutionMode: 'mixed',
  payload,
})
const program2 = (query: ConfigQuery, payload: Partial<AppConfig<typeof ConfigSchema>>) =>
  Effect.gen(function* () {
    const configResolver = yield* ConfigResolver
    return yield* configResolver.get(createRequestWithMix(query, payload))
  })
describe('ConfigResolver Integration Test', () => {
  it('Global + Group + Function', async () => {
    const result = await runner(program({ scope: 'sales', function: 'invoice' }))
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
  it('User Override', async () => {
    const result = await runner(program({ scope: 'sales', function: 'invoice', userId: 'user1' }))
    console.log(JSON.stringify(result, null, 2))
    expect(result).toMatchObject({
      host: 'user1-sales-invoice',
      port: 4000,
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
  it('Scope Override', async () => {
    const result = await runner(program({ scope: 'dev', function: 'invoice' }))

    expect(result).toMatchObject({
      host: 'dev-invoice',
      port: 3200,
      logLevel: 'debug',

      features: {
        audit: true,
        beta: false,
      },
    })
  })
  it('User + Scope', async () => {
    const result = await runner(program({ scope: 'dev', function: 'invoice', userId: 'user1' }))

    expect(result).toMatchObject({
      host: 'user1-dev-invoice',
      port: 3200,

      timeout: 5000,

      logLevel: 'debug',

      features: {
        beta: false,
      },
    })
  })
  it('feature-a scope', async () => {
    const result = await runner(program({ scope: 'feature-a', function: 'invoice' }))

    expect(result).toMatchObject({
      host: 'global-invoice',
      port: 3200,
      logLevel: 'info',
      timeout: 12345,
    })
  })
  it('root fallback', async () => {
    const result = await runner(program({ scope: 'dev', function: 'unknown' }))

    expect(result).toMatchObject({
      host: 'dev-root',
    })
  })
  it('prod+user2', async () => {
    const result = await runner(program({ scope: 'prod', function: 'invoice', userId: 'user2' }))

    expect(result).toMatchObject({
      host: 'user2-prod-invoice',
      port: 5000,
      timeout: 1000,
    })
  })
  it('Runtime Override', async () => {
    const result = await runner(
      program2({ scope: 'prod', function: 'invoice', userId: 'user2' }, { timeout: 9999 }),
    )

    expect(result).toMatchObject({
      host: 'user2-prod-invoice',
      port: 5000,
      timeout: 9999,
    })
  })
})
