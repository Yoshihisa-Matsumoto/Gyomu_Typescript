import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Effect, Layer } from 'effect'

import { AiModelRoute, ModelRoutes } from '@gyomu/ai'
import { PlatformLayer } from '@gyomu/infra'
import * as fs from '@gyomu/infra/fs'
import { TsDocRouteId } from '@gyomu/ai-compiler/jsdoc-update'
import { IOError } from '@gyomu/schema'
import { buildMergePlan } from '../buildMergePlan.js'
import { UpdateError } from '../error/UpdateError.js'
import type { FileAnalysisContext, SymbolId } from '@gyomu/schema/typescript'

import type { ComplexityMetrics } from '../../evaluation/complexity/ComplexityMetrics.js'

const {
  mockBuildJsDocUpdateContext,
  mockBuildJsDocUpdatePlan,
  mockCreateMergePlan,
  mockCalculateComplexityMetrics,
} = vi.hoisted(() => ({
  mockBuildJsDocUpdateContext: vi.fn(),
  mockBuildJsDocUpdatePlan: vi.fn(),
  mockCreateMergePlan: vi.fn(),
  mockCalculateComplexityMetrics: vi.fn(),
}))

vi.mock('../../evaluation/complexity/calculateComplexityMetrics.js', () => ({
  calculateComplexityMetrics: mockCalculateComplexityMetrics,
}))

vi.mock('../internal/buildJsDocUpdateContext.js', () => ({
  buildJsDocUpdateContext: mockBuildJsDocUpdateContext,
}))

vi.mock('../internal/buildJsDocUpdatePlanWithRetry.js', () => ({
  buildJsDocUpdatePlanWithRetry: mockBuildJsDocUpdatePlan,
}))

vi.mock('../internal/createMergePlan.js', () => ({
  createMergePlan: mockCreateMergePlan,
}))

const mockAiModelService = Layer.succeed(AiModelRoute, {
  generateObject: () =>
    Effect.succeed({
      object: {},
    }),
} as any)

const modelRoute = {
  nodes: [{ retry: 1, registry: { fast: {} } } as any],
} as any

const mockModelRoutes = Layer.succeed(ModelRoutes, new Map([[TsDocRouteId, modelRoute]]))

describe('buildMergePlan', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockCalculateComplexityMetrics.mockReturnValue(new Map<SymbolId, ComplexityMetrics>())

    mockBuildJsDocUpdateContext.mockReturnValue({
      symbols: [],
    })

    mockBuildJsDocUpdatePlan.mockReturnValue(Effect.succeed([]))

    mockCreateMergePlan.mockReturnValue(Effect.succeed([]))

    vi.spyOn(fs, 'writeStringToFile').mockReturnValue(Effect.succeed(undefined))
  })

  const fileResult = {
    analysis: {
      path: '/test/example.ts',
      exports: [],
      imports: [],
    },
    metadata: {
      parsedJsDocs: new Map(),
    },
  } as unknown as FileAnalysisContext

  const run = (option?: Parameters<typeof buildMergePlan>[2]) =>
    Effect.runPromise(
      buildMergePlan('test-project', fileResult, option).pipe(
        Effect.provide(mockAiModelService),
        Effect.provide(PlatformLayer),
        Effect.provide(mockModelRoutes),
      ),
    )

  test('should build merge plans', async () => {
    const contexts = {
      symbols: [
        {
          target: {
            symbolId: 'symbol1',
            signatureId: 'test',
          },
        },
        {
          target: {
            symbolId: 'symbol2',
            signatureId: 'test',
          },
        },
      ],
    }

    const plan1 = {
      identity: {
        symbolId: 'symbol1',
        signatureId: 'test',
      },
    }

    const plan2 = {
      identity: {
        symbolId: 'symbol2',
        signatureId: 'test',
      },
    }

    const mergePlan1 = {
      target: {
        symbolId: 'symbol1',
        signatureId: 'test',
      },
    }

    const mergePlan2 = {
      target: {
        symbolId: 'symbol2',
        signatureId: 'test',
      },
    }

    const mapDummy = new Map<SymbolId, ComplexityMetrics>()

    mockCalculateComplexityMetrics.mockReturnValue(mapDummy)
    mockBuildJsDocUpdateContext.mockReturnValue(contexts)
    mockBuildJsDocUpdatePlan.mockReturnValue(Effect.succeed([plan1, plan2]))
    mockCreateMergePlan.mockReturnValue(Effect.succeed([mergePlan1, mergePlan2]))

    const result = await run()

    expect(result).toEqual([mergePlan1, mergePlan2])

    expect(mockCalculateComplexityMetrics).toHaveBeenCalledWith(fileResult)

    expect(mockBuildJsDocUpdateContext).toHaveBeenCalledWith('test-project', fileResult, mapDummy)

    expect(mockBuildJsDocUpdatePlan).toHaveBeenCalledWith(contexts, fileResult, undefined)

    expect(mockCreateMergePlan).toHaveBeenCalledWith(fileResult, [plan1, plan2])
  })

  test('returns an empty array when noLLMRequest is enabled', async () => {
    const contexts = {
      symbols: [],
    }

    mockBuildJsDocUpdateContext.mockReturnValue(contexts)

    const result = await run({
      action: {
        noLLMRequest: true,
      },
    })

    expect(result).toEqual([])

    expect(mockBuildJsDocUpdateContext).toHaveBeenCalledTimes(1)
    expect(mockBuildJsDocUpdatePlan).not.toHaveBeenCalled()
    expect(mockCreateMergePlan).not.toHaveBeenCalled()
  })

  test('dumps JsDocUpdateContext when debug option is enabled', async () => {
    const contexts = {
      symbols: [{ target: 'symbol' }],
    }

    mockBuildJsDocUpdateContext.mockReturnValue(contexts)

    await run({
      debugInfo: {
        JsDocUpdateContext: true,
        DumpToFile: true,
      },
    })

    expect(fs.writeStringToFile).toHaveBeenCalledWith(
      './log/JsDocUpdateContext.txt',
      JSON.stringify(contexts, null, 2),
    )
  })

  test('logs JsDocUpdateContext when debug is enabled without DumpToFile', async () => {
    const contexts = {
      symbols: [{ target: 'symbol' }],
    }

    mockBuildJsDocUpdateContext.mockReturnValue(contexts)

    const consoleSpy = vi.spyOn(console, 'dir').mockImplementation(() => undefined)

    await run({
      debugInfo: {
        JsDocUpdateContext: true,
        DumpToFile: false,
      },
    })

    expect(consoleSpy).toHaveBeenCalledWith(contexts, { depth: null })

    consoleSpy.mockRestore()
  })

  test('creates an empty JsDocUpdatePlan debug file when debug is enabled', async () => {
    await run({
      debugInfo: {
        JsDocUpdatePlan: true,
        DumpToFile: true,
      },
    })

    expect(fs.writeStringToFile).toHaveBeenCalledWith('./log/JsDocUpdatePlan.txt', '')
  })

  test('dumps MergePlan when debug option is enabled', async () => {
    const mergePlans = [
      {
        target: {
          symbolId: 'symbol1',
          signatureId: 'test',
        },
      },
    ]

    mockCreateMergePlan.mockReturnValue(Effect.succeed(mergePlans))

    await run({
      debugInfo: {
        MergePlan: true,
        DumpToFile: true,
      },
    })

    expect(fs.writeStringToFile).toHaveBeenCalledWith(
      './log/MergePlan.txt',
      JSON.stringify(mergePlans, null, 2),
    )
  })

  test('logs MergePlan when debug is enabled without DumpToFile', async () => {
    const mergePlans = [
      {
        target: {
          symbolId: 'symbol1',
          signatureId: 'test',
        },
      },
    ]

    mockCreateMergePlan.mockReturnValue(Effect.succeed(mergePlans))

    const consoleSpy = vi.spyOn(console, 'dir').mockImplementation(() => undefined)

    await run({
      debugInfo: {
        MergePlan: true,
        DumpToFile: false,
      },
    })

    expect(consoleSpy).toHaveBeenCalledWith(mergePlans, { depth: null })

    consoleSpy.mockRestore()
  })

  test('converts LLM plan errors into UpdateError', async () => {
    const error = new Error('llm failed')

    mockBuildJsDocUpdatePlan.mockReturnValue(Effect.fail(error))

    await expect(run()).rejects.toBeInstanceOf(UpdateError)

    await expect(run()).rejects.toMatchObject({
      message: expect.stringContaining('Failed to build merge plan'),
      phase: 'merge-plan',
      filePath: '/test/example.ts',
    })
  })

  test('converts merge plan errors into UpdateError', async () => {
    const error = new Error('merge failed')

    mockCreateMergePlan.mockReturnValue(Effect.fail(error))

    await expect(run()).rejects.toBeInstanceOf(UpdateError)

    await expect(run()).rejects.toMatchObject({
      message: expect.stringContaining('Failed to build merge plan'),
      phase: 'merge-plan',
      filePath: '/test/example.ts',
    })
  })

  test('converts context build errors into UpdateError', async () => {
    mockBuildJsDocUpdateContext.mockImplementation(() => {
      throw new Error('context failed')
    })

    await expect(run()).rejects.toBeInstanceOf(UpdateError)

    await expect(run()).rejects.toMatchObject({
      message: expect.stringContaining('Failed to build merge plan'),
      phase: 'merge-plan',
      filePath: '/test/example.ts',
    })
  })

  test('converts debug file write errors into UpdateError', async () => {
    const error = new IOError({
      message: 'write failed',
      cause: undefined,
      layer: 'filesystem',
      operation: 'write',
    })

    vi.mocked(fs.writeStringToFile).mockReturnValue(Effect.fail(error))

    await expect(
      run({
        debugInfo: {
          JsDocUpdateContext: true,
          DumpToFile: true,
        },
      }),
    ).rejects.toBeInstanceOf(UpdateError)

    await expect(
      run({
        debugInfo: {
          JsDocUpdateContext: true,
          DumpToFile: true,
        },
      }),
    ).rejects.toMatchObject({
      message: expect.stringContaining('Failed to build merge plan'),
      phase: 'merge-plan',
      filePath: '/test/example.ts',
    })
  })
})
