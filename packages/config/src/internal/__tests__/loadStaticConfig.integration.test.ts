import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { Config, Effect, Layer } from 'effect'
import { ConfigLayer, MainLayer, PlatformLayer } from '@gyomu/infra'

import { makeRunner } from '@gyomu/schema/effect'
import { logger } from '@gyomu/schema'
import { loadStaticConfig } from '../loadStaticConfig.js'
import { ConfigRootDirectory } from '../../services/ConfigRootDirectory.js'
import type { ConfigQuery } from '../../ConfigQuery.js'

const fixtureRoot = fileURLToPath(new URL('../../../test-fixtures/config', import.meta.url))
logger.debug(fixtureRoot)

const rawConfig = Config.all({
  appName: Config.option(Config.string('appName')),
  logLevel: Config.option(Config.string('logLevel')),
  host: Config.option(Config.string('host')),
  port: Config.option(Config.number('port')),
})

const ConfigRootDirectoryTestLayer = Layer.succeed(ConfigRootDirectory, {
  get: () => Effect.succeed(fixtureRoot),
})
const TestLayer = Layer.mergeAll(MainLayer, ConfigLayer, ConfigRootDirectoryTestLayer)
  .pipe(Layer.provideMerge(ConfigRootDirectoryTestLayer))
  .pipe(Layer.provideMerge(ConfigLayer))
  .pipe(Layer.provideMerge(PlatformLayer))
const execute = (query: ConfigQuery) =>
  makeRunner(TestLayer)(
    loadStaticConfig({
      rawConfig: rawConfig,
      query,
    }),
  )

describe('loadStaticConfig', () => {
  describe('global layer', () => {
    it('loads group/function config from global layer', async () => {
      const result = await execute({
        scope: 'sales',
        function: 'invoice',
      })

      expect(result).toHaveLength(1)
      console.log(JSON.stringify(result[0], null, 2))
      expect(result[0]).toMatchObject({
        layer: 'global',
        source: 'file',
        values: {
          logLevel: 'info',
          host: 'global-sales-invoice',
          port: 3000,
        },
      })
    })

    it('falls back to function config in global layer', async () => {
      const result = await execute({
        scope: 'unknown',
        function: 'invoice',
      })

      expect(result).toHaveLength(1)
      console.log(JSON.stringify(result, null, 2))
      expect(result[0]).toMatchObject({
        layer: 'global',
        source: 'file',
        values: {
          host: 'global-invoice',
          port: 3200,
          logLevel: 'info',
        },
      })
    })
  })
  describe('scope layer', () => {
    it('loads function config from scope layer', async () => {
      const result = await execute({
        scope: 'dev',
        function: 'invoice',
      })

      const scopeConfig = result.find((x) => x.layer === 'scope')

      expect(scopeConfig).toMatchObject({
        layer: 'scope',
        values: {
          host: 'dev-invoice',
        },
      })
    })
    it('falls back to root config in scope layer', async () => {
      const result = await execute({
        scope: 'dev',
        function: 'unknown',
      })

      const scopeConfig = result.find((x) => x.layer === 'scope')

      expect(scopeConfig).toMatchObject({
        layer: 'scope',
        values: {
          host: 'dev-root',
        },
      })
    })
  })
  describe('user layer', () => {
    it('loads user config using group/function lookup', async () => {
      const result = await execute({
        userId: 'user1',
        scope: 'sales',
        function: 'invoice',
      })

      const userConfig = result.find((x) => x.layer === 'user')

      expect(userConfig).toMatchObject({
        layer: 'user',
        values: {
          host: 'user1-sales-invoice',
          port: 4000,
        },
      })
    })
  })
  describe('user-group layer', () => {
    it('loads user-scope function config', async () => {
      const result = await execute({
        userId: 'user1',
        scope: 'dev',
        function: 'invoice',
      })

      const config = result.find((x) => x.layer === 'user-scope')

      expect(config).toMatchObject({
        layer: 'user-scope',
        values: {
          host: 'user1-dev-invoice',
        },
      })
    })
    it('falls back to root config in user-scope layer', async () => {
      const result = await execute({
        userId: 'user1',
        scope: 'dev',
        function: 'unknown',
      })

      const config = result.find((x) => x.layer === 'user-scope')

      expect(config).toMatchObject({
        layer: 'user-scope',
        values: {
          host: 'user1-dev-root',
        },
      })
    })
    it('loads all matching layers', async () => {
      const result = await execute({
        userId: 'user1',
        scope: 'dev',
        function: 'invoice',
      })

      expect(result.map((x) => x.layer)).toEqual(['global', 'user', 'scope', 'user-scope'])
    })
  })
  describe('missing configuration', () => {
    it('skips unmatched configuration', async () => {
      const result = await execute({
        function: 'not-found',
      })

      expect(result).toEqual([])
    })
    it('ignores missing user file', async () => {
      const result = await execute({
        userId: 'missing-user',
        function: 'invoice',
      })

      expect(result.map((x) => x.layer)).toEqual(['global'])
    })
  })
})
