import { Layer } from 'effect'
import { AiModelRoute } from '../../routing/AiModelRouteService.js'
import { ModelRoutes } from '../../routing/ModelRoutes.js'
import { VercelAiModelExecutionLive } from './VercelAiModelExecutionLive.js'
import type { ModelRouteId } from '../../routing/ModelRouteId.js'
import type { ModelRoute } from '../../routing/ModelRoute.js'

export * from './VercelAiModelServiceLive.js'

/**
 * Creates a Vercel AI layer by merging model routes with the underlying execution provider.
 *
 * @param maps The collection of model routes to be included in the layer.
 *
 * @returns A configured Layer for Vercel AI integration.
 */
export const createVercelAiLayer = (maps: ReadonlyMap<ModelRouteId, ModelRoute>) => {
  const modelRoutes = Layer.succeed(ModelRoutes, maps)
  return Layer.mergeAll(AiModelRoute.live, modelRoutes).pipe(
    Layer.provide(VercelAiModelExecutionLive),
    Layer.provide(modelRoutes),
  )
}
