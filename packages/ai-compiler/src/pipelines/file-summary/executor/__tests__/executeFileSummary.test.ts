import { describe, expect, test, vi } from 'vitest'
import { Effect, Layer } from 'effect'
import { AiModelRoute, ModelRoutes } from '@gyomu/ai'

import { PlatformLayer } from '@gyomu/infra'
import { FileSummaryRouteId, executeFileSummary } from '../executeFileSummary.js'
import { renderFileConceptInput } from '../../renderer/renderFileConceptInput.js'
import type { GenerateTextParams, ModelRoute, ModelRouteId, RouteNode } from '@gyomu/ai'
import type { FileConceptInput } from '../../context/FileConceptInput.js'

describe('executeFileSummary', () => {
  test('returns generated text', async () => {
    const generateText = vi.fn(() =>
      Effect.succeed({
        message: {
          text: 'Generated summary',
        },
      }),
    )

    const mockAiModelRoute = Layer.succeed(AiModelRoute, {
      generateText,
    } as any)

    const modelRoute = {
      nodes: [{ retry: 1, registry: { fast: {} } } as any as RouteNode],
    } as ModelRoute

    const mockModelRoutes = Layer.succeed(
      ModelRoutes,
      new Map<ModelRouteId, ModelRoute>([[FileSummaryRouteId, modelRoute]]),
    )

    const context: FileConceptInput = {
      path: 'src/test.ts',
      exports: [],
    }

    const result = await Effect.runPromise(
      executeFileSummary(context).pipe(
        Effect.provide(PlatformLayer),
        Effect.provide(mockModelRoutes),
        Effect.provide(mockAiModelRoute),
      ),
    )

    expect(result).toBe('Generated summary')

    expect(generateText).toHaveBeenCalledTimes(1)

    const paramsA = generateText.mock.calls[0] as unknown as Array<GenerateTextParams>
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const params = paramsA[0]!
    // console.dir(params, { depth: null })
    expect(params.routeId).toBe(FileSummaryRouteId)
    expect(params.key).toBe('fast')
    expect(params.messages).toHaveLength(2)
    if (params.messages?.length == 2) {
      expect(params.messages[0]?.role).toBe('system')
      expect(params.messages[1]?.role).toBe('user')

      expect(params.messages[1]?.content).toContain('src/test.ts')
      expect(params.messages[1]?.content).toContain(renderFileConceptInput(context))
    }
  })
})
