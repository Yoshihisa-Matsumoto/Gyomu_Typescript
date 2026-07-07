import { Context, Effect } from 'effect'
import { RouteNotFoundError } from '../error/RouteNotFoundError.js'
import type { ModelRouteId } from './ModelRouteId.js'
import type { ModelRoute } from './ModelRoute.js'

export class ModelRoutes extends Context.Service<
  ModelRoutes,
  ReadonlyMap<ModelRouteId, ModelRoute>
>()('ModelRoutes') {}

export const getModelRoute = (
  routeId: ModelRouteId,
): Effect.Effect<ModelRoute, RouteNotFoundError, ModelRoutes> =>
  Effect.gen(function* () {
    const modelRoutes = yield* ModelRoutes
    if (!modelRoutes.has(routeId))
      return yield* Effect.fail(
        new RouteNotFoundError({ id: routeId, cause: undefined, message: 'Route Id Not Found' }),
      )
    return modelRoutes.get(routeId)!
  })
