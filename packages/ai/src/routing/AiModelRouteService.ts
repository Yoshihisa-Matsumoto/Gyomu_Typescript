import { Context, Effect, Layer } from 'effect'
import { AiModelExecution } from '../provider/types/AiModelExecuion.js'
import { runWithModelRoute } from './runWithModelRoute.js'
import { ModelRoutes, getModelRoute } from './ModelRoutes.js'
import type { Schema } from 'effect'
import type { AiObjectResult } from '../execution/AiObjectResult.js'
import type { AiGenerateTextResult } from '../execution/AiGenerateTextResult.js'
import type { Request } from '../execution/Request.js'
import type { ModelSelection, RouteSelection } from '../execution/RouteSelection.js'
import type { ModelRouteId } from './ModelRouteId.js'
import type { ToolConfig } from '../execution/ToolConfig.js'
import type { PromptInput } from '../execution/PromptInput.js'
import type { AiModelRegistry } from '../model/AiModels.js'
import type { StreamTextResult } from 'ai'
import type { AiError } from '@gyomu/schema'
import type { EffectArrayableSchema } from '@gyomu/schema/entity'
import type { RouteNotFoundError } from '../error/RouteNotFoundError.js'

export type { StreamTextResult } from 'ai'

export type GenerateTextParams = Request<
  RouteSelection & ModelSelection,
  PromptInput &
    ToolConfig & {
      readonly maxTokens?: number
    }
>

export type StreamTextParams = Request<
  RouteSelection & ModelSelection,
  PromptInput &
    ToolConfig & {
      readonly maxTokens?: number
    }
>

export type GenerateObjectParams<TSchema extends EffectArrayableSchema> = Request<
  RouteSelection & ModelSelection,
  PromptInput &
    ToolConfig & {
      readonly schema: TSchema
    }
>

export type EmbedParams<TValue> = Request<
  RouteSelection,
  {
    value: TValue
  }
>

/**
 * =========================================
 * Service Definition
 * =========================================
 */

export interface AiModelRouteService {
  readonly generateText: (
    params: GenerateTextParams,
  ) => Effect.Effect<AiGenerateTextResult, RouteNotFoundError | AiError, ModelRoutes>

  readonly streamText: (
    params: StreamTextParams,
  ) => Effect.Effect<
    StreamTextResult<Record<string, never>, never>,
    RouteNotFoundError | AiError,
    ModelRoutes
  >

  readonly generateObject: <TSchema extends EffectArrayableSchema>(
    params: GenerateObjectParams<TSchema>,
  ) => Effect.Effect<
    AiObjectResult<Schema.Schema.Type<TSchema>>,
    RouteNotFoundError | AiError,
    ModelRoutes
  >

  readonly embed: <TValue>(
    params: EmbedParams<TValue>,
  ) => Effect.Effect<ReadonlyArray<number>, RouteNotFoundError | AiError, ModelRoutes>
}

/**
 * =========================================
 * Context Tag
 * =========================================
 */

export class AiModelRoute extends Context.Service<AiModelRoute, AiModelRouteService>()(
  '@gyomu/ai/AiModelRouteService',
  {
    make: Effect.gen(function* () {
      const executionService = yield* AiModelExecution
      yield* ModelRoutes
      return {
        generateText: (params: GenerateTextParams) =>
          executeRoute(params, (registry) => executionService.generateText(registry, params)),
        streamText: (params: StreamTextParams) =>
          executeRoute(params, (registry) => executionService.streamText(registry, params)),
        generateObject: <TSchema extends EffectArrayableSchema>(
          params: GenerateObjectParams<TSchema>,
        ) => executeRoute(params, (registry) => executionService.generateObject(registry, params)),
        embed: <TValue>(params: EmbedParams<TValue>) =>
          executeRoute(params, (registry) => executionService.embed(registry, params)),
      }
    }),
  },
) {
  static readonly live = Layer.effect(this, this.make)
}

const executeRoute = <T extends { readonly routeId: ModelRouteId }, A>(
  params: T,
  execute: (registry: AiModelRegistry) => Effect.Effect<A, AiError>,
) =>
  Effect.gen(function* () {
    const route = yield* getModelRoute(params.routeId)
    return yield* runWithModelRoute(route, execute)
  })
