import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Effect, Layer } from 'effect'

import { AiModelService } from '@gyomu/ai'
import { PlatformLayer } from '@gyomu/infra'
import { buildMergePlan } from '../buildMergePlan.js'
import { UpdateError } from '../error/UpdateError.js'
import type { SymbolId } from '@gyomu/schema/typescript'

import type { ComplexityMetrics } from '../../evaluation/complexity/ComplexityMetrics.js'
import type { FileAnalysisResult } from '@gyomu/ts-analysis'

const { mockBuildJsDocUpdateContext } = vi.hoisted(() => ({
  mockBuildJsDocUpdateContext: vi.fn(),
}))

const { mockBuildJsDocUpdateContextPlan: mockBuildJsDocUpdatePlan } = vi.hoisted(() => ({
  mockBuildJsDocUpdateContextPlan: vi.fn(),
}))

const { mockCreateMergePlan } = vi.hoisted(() => ({
  mockCreateMergePlan: vi.fn(),
}))

const { mockCalculateComplexityMetrics } = vi.hoisted(() => ({
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

vi.mock('../internal/createMargePlan.js', () => ({
  createMergePlan: mockCreateMergePlan,
}))
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
const mockAiModelService = Layer.succeed(AiModelService, {
  generateObject: () =>
    Effect.succeed({
      object: {},
    }),
} as any)
describe('buildMergePlan', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
  } as unknown as FileAnalysisResult

  test('should build merge plans', async () => {
    const context1 = {
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

    // const context2 = {
    //   target: {
    //     symbolId: 'symbol2',
    //   },
    // }

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

    mockBuildJsDocUpdateContext.mockReturnValue(context1)

    mockBuildJsDocUpdatePlan.mockReturnValueOnce(Effect.succeed([plan1, plan2]))

    mockCreateMergePlan.mockReturnValueOnce(Effect.succeed([mergePlan1, mergePlan2]))
    // .mockReturnValueOnce(Effect.succeed(mergePlan2))

    const mapDummy = new Map<SymbolId, ComplexityMetrics>()
    mockCalculateComplexityMetrics.mockReturnValue(mapDummy)
    const result = await Effect.runPromise(
      buildMergePlan('test-project', fileResult).pipe(
        Effect.provide(mockAiModelService),
        Effect.provide(PlatformLayer),
      ),
    )

    expect(result).toEqual([mergePlan1, mergePlan2])

    expect(mockBuildJsDocUpdateContext).toHaveBeenCalledWith('test-project', fileResult, mapDummy)

    expect(mockBuildJsDocUpdatePlan).toHaveBeenCalledTimes(1)

    expect(mockCreateMergePlan).toHaveBeenCalledWith(fileResult, [plan1, plan2])

    // expect(mockCreateMergePlan).toHaveBeenCalledWith(fileResult.analysis.path, context2, plan2)
  })

  test('should convert plan errors into UpdateError', async () => {
    const context = {
      target: {
        symbolId: 'symbol1',
      },
    }

    mockBuildJsDocUpdateContext.mockReturnValue([context])

    mockBuildJsDocUpdatePlan.mockReturnValue(Effect.fail(new Error('llm failed')))

    await expect(
      Effect.runPromise(
        buildMergePlan('test-project', fileResult).pipe(
          Effect.provide(mockAiModelService),
          Effect.provide(PlatformLayer),
        ),
      ),
    ).rejects.toBeInstanceOf(UpdateError)
  })

  test('should convert context build errors into UpdateError', async () => {
    mockBuildJsDocUpdateContext.mockImplementation(() => {
      throw new Error('context failed')
    })

    await expect(
      Effect.runPromise(
        buildMergePlan('test-project', fileResult).pipe(
          Effect.provide(mockAiModelService),
          Effect.provide(PlatformLayer),
        ),
      ),
    ).rejects.toBeInstanceOf(UpdateError)
  })
})
