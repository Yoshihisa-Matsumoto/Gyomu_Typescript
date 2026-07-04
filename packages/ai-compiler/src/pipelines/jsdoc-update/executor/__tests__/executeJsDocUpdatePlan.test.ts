import { describe, expect, test } from 'vitest'
import { Effect, Layer } from 'effect'
import { NodeFileSystem } from '@effect/platform-node'
import { AiModelService } from '@gyomu/ai'

import { SignatureId, SymbolId } from '@gyomu/schema/typescript'
import { executeJsDocUpdatePlan } from '../executeJsDocUpdatePlan.js'
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

    const mockAiModelService = Layer.succeed(AiModelService, {
      generateObject: () =>
        Effect.succeed({
          object: expected,
        }),
    } as any)

    const context = {
      mode: 'light',
    } as any

    const result = await Effect.runPromise(
      executeJsDocUpdatePlan(context).pipe(
        Effect.provide(mockAiModelService),
        Effect.provide(NodeFileSystem.layer),
      ),
    )

    expect(result).toEqual(expected)
  })
})
