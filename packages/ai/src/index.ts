import { Effect, Layer } from 'effect'
import { AiModelRoute } from './routing/AiModelRouteService.js'
import { ModelRoutes } from './routing/ModelRoutes.js'
import type { RouteNode } from './routing/RouteNode.js'
import type { ModelRoute } from './routing/ModelRoute.js'
import type { ModelRouteId } from './routing/ModelRouteId.js'

export * from './tool/index.js'
export * from './model/index.js'
export * from './provider/index.js'
export * from './routing/index.js'
export * from './error/index.js'

/**
 * Creates a mock AI layer configured for a specific model route.
 *
 * @param routeId The model route identifier to associate with the mock route.
 *
 * @returns An Effect Layer containing the mocked AI services.
 */
export const createMockAiLayer = (routeId: ModelRouteId) => {
  const mockAiModelService = Layer.succeed(AiModelRoute, {
    generateObject: () => Effect.succeed({ object: {} }),
  } as any)

  const modelRoute = {
    nodes: [{ retry: 1, registry: { fast: {} } } as any as RouteNode],
  } as ModelRoute
  const mockModelRoutes = Layer.succeed(
    ModelRoutes,
    new Map<ModelRouteId, ModelRoute>([[routeId, modelRoute]]),
  )
  return Layer.mergeAll(mockAiModelService, mockModelRoutes).pipe(Layer.provide(mockAiModelService))
}
