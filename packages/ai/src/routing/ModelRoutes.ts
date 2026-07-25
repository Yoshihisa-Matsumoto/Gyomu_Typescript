import { Context, Effect } from 'effect'
import { RouteNotFoundError } from '../error/RouteNotFoundError.js'
import type { ModelRouteId } from './ModelRouteId.js'
import type { ModelRoute } from './ModelRoute.js'

/**
 * Defines a service for accessing configured model routes.
 */
export class ModelRoutes extends Context.Service<
  ModelRoutes,
  ReadonlyMap<ModelRouteId, ModelRoute>
>()('ModelRoutes') {}

/**
 * Retrieves a specific model route by its identifier.
 *
 * @param routeId The unique identifier of the model route to retrieve.
 *
 * @returns An Effect that yields the requested ModelRoute or fails with a RouteNotFoundError.
 *
 * @requires ModelRoutes service.
 */
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
