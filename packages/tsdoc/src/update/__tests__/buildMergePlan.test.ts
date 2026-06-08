import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Effect, Layer } from 'effect'

import { AiModelService } from '@gyomu/ai'
import { PlatformLayer } from '@gyomu/infra'
import { buildMergePlan } from '../buildMergePlan.js'
import { UpdateError } from '../error/UpdateError.js'

import type { FileAnalysisResult } from '../../analysis/file/FileAnalysisResult.js'

const { mockBuildJsDocUpdateContext } = vi.hoisted(() => ({
  mockBuildJsDocUpdateContext: vi.fn(),
}))

const { mockBuildJsDocUpdateContextPlan: mockBuildJsDocUpdatePlan } = vi.hoisted(() => ({
  mockBuildJsDocUpdateContextPlan: vi.fn(),
}))

const { mockCreateMergePlan } = vi.hoisted(() => ({
  mockCreateMergePlan: vi.fn(),
}))

vi.mock('../internal/buildJsDocUpdateContext.js', () => ({
  buildJsDocUpdateContext: mockBuildJsDocUpdateContext,
}))

vi.mock('../internal/buildJsDocUpdatePlan.js', () => ({
  buildJsDocUpdatePlan: mockBuildJsDocUpdatePlan,
}))

vi.mock('../internal/createMargePlan.js', () => ({
  createMergePlan: mockCreateMergePlan,
}))
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
      target: {
        symbolId: 'symbol1',
      },
    }

    const context2 = {
      target: {
        symbolId: 'symbol2',
      },
    }

    const plan1 = {
      identity: {
        symbolId: 'symbol1',
      },
    }

    const plan2 = {
      identity: {
        symbolId: 'symbol2',
      },
    }

    const mergePlan1 = {
      target: {
        symbolId: 'symbol1',
      },
    }

    const mergePlan2 = {
      target: {
        symbolId: 'symbol2',
      },
    }

    mockBuildJsDocUpdateContext.mockReturnValue([context1, context2])

    mockBuildJsDocUpdatePlan
      .mockReturnValueOnce(Effect.succeed(plan1))
      .mockReturnValueOnce(Effect.succeed(plan2))

    mockCreateMergePlan
      .mockReturnValueOnce(Effect.succeed(mergePlan1))
      .mockReturnValueOnce(Effect.succeed(mergePlan2))

    const result = await Effect.runPromise(
      buildMergePlan('test-project', fileResult).pipe(
        Effect.provide(mockAiModelService),
        Effect.provide(PlatformLayer),
      ),
    )

    expect(result).toEqual([mergePlan1, mergePlan2])

    expect(mockBuildJsDocUpdateContext).toHaveBeenCalledWith('test-project', fileResult)

    expect(mockBuildJsDocUpdatePlan).toHaveBeenCalledTimes(2)

    expect(mockCreateMergePlan).toHaveBeenCalledWith(fileResult.analysis.path, context1, plan1)

    expect(mockCreateMergePlan).toHaveBeenCalledWith(fileResult.analysis.path, context2, plan2)
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
