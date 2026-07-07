import { Effect, Layer } from 'effect'
import { describe, expect, it, vi } from 'vitest'
import { ModelRoutes } from '../ModelRoutes.js'
import { ModelRouteId } from '../ModelRouteId.js'
import { AiModelExecution } from '../../provider/types/AiModelExecuion.js'
import { AiModelRoute } from '../AiModelRouteService.js'
import { RouteNotFoundError } from '../../error/RouteNotFoundError.js'
import type { AiGenerateTextResult } from '../../execution/AiGenerateTextResult.js'
import type { ModelRoute } from '../ModelRoute.js'
import type { AiModelRegistry } from '../../model/AiModels.js'
import type { GenerateTextParams } from '../AiModelRouteService.js'

const registry = {} as any as AiModelRegistry

const route = {
  nodes: [{ registry }],
} as any as ModelRoute

const routes = Layer.succeed(ModelRoutes, new Map([[ModelRouteId('chat'), route]]))

const execution = {
  generateText: vi.fn(),
  streamText: vi.fn(),
  generateObject: vi.fn(),
  embed: vi.fn(),
}

const executionLayer = Layer.succeed(AiModelExecution, execution)

const layer = Layer.mergeAll(routes, executionLayer, AiModelRoute.live).pipe(
  Layer.provide(executionLayer),
  Layer.provide(routes),
)

describe('AiModelRouteServiceLive', () => {
  it('generateText delegates to execution service', async () => {
    const expected = {} as AiGenerateTextResult

    execution.generateText.mockReturnValue(Effect.succeed(expected))

    const params = {
      routeId: 'chat',
      model: 'smart',
      prompt: 'hello',
    } as any as GenerateTextParams

    const service = await Effect.runPromise(AiModelRoute.pipe(Effect.provide(layer)))

    const result = await Effect.runPromise(
      service.generateText(params).pipe(Effect.provide(routes)),
    )

    expect(result).toBe(expected)

    expect(execution.generateText).toHaveBeenCalledWith(registry, params)
  })
  it('streamText delegates to execution service', async () => {
    const expected = {} as any

    execution.streamText.mockReturnValue(Effect.succeed(expected))

    const params = {
      routeId: 'chat',
      model: 'smart',
      prompt: 'hello',
    } as any

    const service = await Effect.runPromise(AiModelRoute.pipe(Effect.provide(layer)))

    const result = await Effect.runPromise(service.streamText(params).pipe(Effect.provide(routes)))

    expect(result).toBe(expected)

    expect(execution.streamText).toHaveBeenCalledWith(registry, params)
  })
  it('generateObject delegates to execution service', async () => {
    const expected = {} as any

    execution.generateObject.mockReturnValue(Effect.succeed(expected))

    const params = {
      routeId: 'chat',
      model: 'smart',
      prompt: 'hello',
    } as any

    const service = await Effect.runPromise(AiModelRoute.pipe(Effect.provide(layer)))

    const result = await Effect.runPromise(
      service.generateObject(params).pipe(Effect.provide(routes)),
    )

    expect(result).toBe(expected)

    expect(execution.generateObject).toHaveBeenCalledWith(registry, params)
  })
  it('embed delegates to execution service', async () => {
    const expected = {} as any

    execution.embed.mockReturnValue(Effect.succeed(expected))

    const params = {
      routeId: 'chat',
      model: 'smart',
      prompt: 'hello',
    } as any

    const service = await Effect.runPromise(AiModelRoute.pipe(Effect.provide(layer)))

    const result = await Effect.runPromise(service.embed(params).pipe(Effect.provide(routes)))

    expect(result).toBe(expected)

    expect(execution.embed).toHaveBeenCalledWith(registry, params)
  })

  it('fails when route does not exist', async () => {
    const expected = {} as AiGenerateTextResult

    execution.generateText.mockReturnValue(Effect.succeed(expected))

    const params = {
      routeId: 'unknown',
      model: 'smart',
      prompt: 'hello',
    } as any as GenerateTextParams

    const service = await Effect.runPromise(AiModelRoute.pipe(Effect.provide(layer)))

    const error = await Effect.runPromise(
      service.generateText(params).pipe(Effect.flip, Effect.provide(routes)),
    )

    expect(error).toBeInstanceOf(RouteNotFoundError)
  })
})
