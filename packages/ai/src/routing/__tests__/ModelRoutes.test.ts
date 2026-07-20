import { describe, expect, it } from 'vitest'
import { Effect, Layer } from 'effect'

import { ModelRoutes, getModelRoute } from '../ModelRoutes.js'
import { RouteNotFoundError } from '../../error/RouteNotFoundError.js'
import { ModelRouteId } from '../ModelRouteId.js'
import type { ModelRoute } from '../ModelRoute.js'

describe('getModelRoute', () => {
  const route = {
    id: 'chat',
    // 必要なプロパティ
  } as any as ModelRoute

  const layer = Layer.succeed(ModelRoutes, new Map([[ModelRouteId('chat'), route]]))

  it('returns route when found', async () => {
    const result = await Effect.runPromise(
      getModelRoute(ModelRouteId('chat')).pipe(Effect.provide(layer)),
    )

    expect(result).toBe(route)
  })

  it('fails when route does not exist', async () => {
    const error = await Effect.runPromise(
      getModelRoute(ModelRouteId('unknown')).pipe(Effect.flip, Effect.provide(layer)),
    )

    expect(error).toBeInstanceOf(RouteNotFoundError)
    expect(error.id).toBe('unknown')
  })
})
