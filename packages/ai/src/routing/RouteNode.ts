import type { AiModelRegistry } from '../model/AiModels.js'

export interface RouteNode {
  readonly registry: AiModelRegistry

  readonly retry: number
}
