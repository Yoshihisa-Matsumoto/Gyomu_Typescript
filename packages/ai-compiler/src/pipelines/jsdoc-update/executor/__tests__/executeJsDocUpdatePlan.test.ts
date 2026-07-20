import { describe, expect, test } from 'vitest'
import { Effect, Layer } from 'effect'
import { NodeFileSystem } from '@effect/platform-node'
import { AiModelRoute, ModelRoutes } from '@gyomu/ai'

import { SignatureId, SymbolId } from '@gyomu/schema/typescript'
import { TsDocRouteId, executeJsDocUpdatePlan } from '../executeJsDocUpdatePlan.js'
import type { ModelRoute, ModelRouteId, RouteNode } from '@gyomu/ai'
import type { JsDocUpdatePlan } from '../../schema/JsDocUpdatePlan.js'

describe('executeJsDocUpdatePlan', () => {
  test('returns object from AiModelService', async () => {
    const expected: JsDocUpdatePlan = [
      {
        identity: {
          signatureId: SignatureId('(filePath: string) => string'),
          symbolId: SymbolId('readFile'),
        },
        summary: {
          action: { type: 'replace', value: 'Reads file content' },
          confidence: 0.95,
        },
        params: [],
        returns: {
          action: { type: 'preserve' },
          confidence: 1,
        },
        tags: [],
        reasoning: {
          summary: 'Test',
          paramMapping: 'Test',
          returnMapping: 'Test',
        },
        risk: {
          hasHumanConflict: false,
          riskLevel: 'low',
        },
      },
    ]

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const mockAiModelService = Layer.succeed(AiModelRoute, {
      generateObject: () =>
        Effect.succeed({
          object: expected,
        }),
    } as any)

    const modelRoute = {
      nodes: [{ retry: 1, registry: { fast: {} } } as any as RouteNode],
    } as ModelRoute
    const mockModelRoutes = Layer.succeed(
      ModelRoutes,
      new Map<ModelRouteId, ModelRoute>([[TsDocRouteId, modelRoute]]),
    )

    const context = {
      mode: 'light',
    } as any

    const result = await Effect.runPromise(
      executeJsDocUpdatePlan(context).pipe(
        Effect.provide(NodeFileSystem.layer),
        Effect.provide(mockModelRoutes),
        Effect.provide(mockAiModelService),
      ),
    )

    expect(result).toEqual(expected)
  })
})
