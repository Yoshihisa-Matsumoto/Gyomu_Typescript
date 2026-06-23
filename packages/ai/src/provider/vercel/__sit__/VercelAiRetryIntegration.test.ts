import { describe, expect, it } from 'vitest'
import { Effect, Layer } from 'effect'

import { makeRunnerAsReturn } from '@gyomu/schema/effect'
import { ConfigLayer, MainLayer, PlatformLayer } from '@gyomu/infra'
import { AiModelService } from '../../types/AiModelService.js'
import { VercelAiModelServiceLive } from '../VercelAiModelServiceLive.js'

import { AI_MODELS } from '../../../model/AiModels.js'
import 'dotenv/config'
import type { AiError } from '@gyomu/schema'

const layer = Layer.provideMerge(MainLayer, ConfigLayer).pipe(Layer.provideMerge(PlatformLayer))
const runVercelQAWithEnvResult = makeRunnerAsReturn(VercelAiModelServiceLive)
/**
 * =========================================
 * Test Guard
 * =========================================
 */

const describeIfApiKey =
  process.env.GEMINI_API_KEY && process.env.PERFORMANCE_TEST ? describe : describe.skip

describeIfApiKey('Retry Integration', () => {
  it('captures real rate limit information', async () => {
    const start = Date.now()
    const exit = await runVercelQAWithEnvResult(
      Effect.gen(function* () {
        const service = yield* AiModelService

        const effects = Array.from({ length: 30 }, (_, i) =>
          service.generateText({
            model: AI_MODELS.fast,
            prompt: `Return only ${i}`,
            retryOption: {
              maxAttempts: 5,
              observer: {
                onRetry: (params: { error: AiError; attempt: number; delayMs: number }) => {
                  console.log(`DelayMs: ${params.delayMs} on attempt ${params.attempt}`)
                },
              },
            },
          }),
        )

        const result = yield* Effect.all(effects, {
          concurrency: 'unbounded',
        })

        console.dir(result, { depth: null })

        return result
      }),
      layer,
    )
    const elapsed = Date.now() - start

    console.log({
      elapsedMs: elapsed,
      exit,
    })

    expect(exit._tag).toBe('Success')
  }, 300_000)
})
