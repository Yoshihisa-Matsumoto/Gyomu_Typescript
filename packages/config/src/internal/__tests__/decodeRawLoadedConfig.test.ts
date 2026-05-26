import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Effect } from 'effect'

import { convertToSchemaObjectWithEffect } from '@gyomu/schema/entity'
import { SchemaValidationError } from '@gyomu/schema'
import { decodeRawLoadedConfigs } from '../decodeRawLoadedConfig.js'

vi.mock('@gyomu/schema/entity', async () => {
  const actual = await vi.importActual('@gyomu/schema/entity')
  return {
    ...actual,
    convertToSchemaObjectWithEffect: vi.fn(),
  }
})

const mockedConvert = vi.mocked(convertToSchemaObjectWithEffect)

beforeEach(() => {
  vi.clearAllMocks()
})
const request = {
  query: {
    scope: 'dev',
    function: 'testFn',
  },
  schema: {
    mapFields: vi.fn((fn) => ({
      __mapped: true,
      fn,
    })),
  },
} as any

describe('decodeRawLoadedConfig test', () => {
  it('decodes single config', async () => {
    const configs = [
      {
        layer: 'global',
        source: 'file',
        values: { host: 'localhost' },
      },
    ] as any

    mockedConvert.mockImplementation(() => {
      return (schema: any, config: any) => Effect.succeed({ host: 'localhost' })
    })

    const result = await decodeRawLoadedConfigs(request, configs).pipe(Effect.runPromise)

    expect(result).toEqual([{ layer: 'global', source: 'file', values: { host: 'localhost' } }])

    expect(mockedConvert).toHaveBeenCalledTimes(1)
  })

  it('decodes multiple configs', async () => {
    const configs = [
      { layer: 'global', source: 'file', values: { a: 1 } },
      { layer: 'scope', source: 'file', values: { b: 2 } },
    ] as any

    mockedConvert
      .mockImplementationOnce(() => {
        return (schema: any, config: any) => Effect.succeed({ a: 1 })
      })
      .mockImplementationOnce(() => {
        return (schema: any, config: any) => Effect.succeed({ b: 2 })
      })

    const result = await decodeRawLoadedConfigs(request, configs).pipe(Effect.runPromise)

    expect(result).toEqual([
      { layer: 'global', source: 'file', values: { a: 1 } },
      { layer: 'scope', source: 'file', values: { b: 2 } },
    ])
  })

  it('wraps decode error into ConfigResolutionError', async () => {
    const configs = [
      {
        layer: 'global',
        source: 'file',
        values: { invalid: true },
      },
    ] as any

    const error = new SchemaValidationError({
      cause: undefined,
      message: 'fail',
      phase: 'decode' as const,
      schemaName: 'test',
    })

    mockedConvert.mockImplementation(() => {
      return (schema: any, config: any) => Effect.fail(error)
    })

    await expect(
      decodeRawLoadedConfigs(request, configs).pipe(Effect.runPromise),
    ).rejects.toMatchObject({
      _tag: 'ConfigResolutionError',
    })
  })
})
