import { Effect, Result } from 'effect'
import type { ModelRoute } from './ModelRoute.js'
import type { AiModelRegistry } from '../model/AiModels.js'
import type { AiError } from '@gyomu/schema'

/**
 * Executes an operation across a sequence of model registry nodes in a route, attempting fallbacks when an error occurs.
 *
 * @param route The route definition containing the sequence of model registry nodes.
 *
 * @param execute The function to execute against a registry node.
 *
 * @returns An Effect representing the success result or the last encountered error if all nodes fail.
 */
export const runWithModelRoute = <A>(
  route: ModelRoute,
  execute: (registry: AiModelRegistry) => Effect.Effect<A, AiError>,
): Effect.Effect<A, AiError> => {
  return Effect.gen(function* () {
    let lastError: AiError | undefined

    for (const node of route.nodes) {
      const result = yield* Effect.result(execute(node.registry))

      if (Result.isSuccess(result)) {
        return result.success
      }

      lastError = result.failure

      if (!lastError.canFallback) {
        return yield* Effect.fail(lastError)
      }
    }

    return yield* Effect.fail(lastError!)
  })
}
