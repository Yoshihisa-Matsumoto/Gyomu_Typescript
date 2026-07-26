import type { AiModelRegistryKey } from '../model/AiModels.js'
import type { ModelRouteId } from '../routing/ModelRouteId.js'

/**
 * Defines a selection of an AI model using its registry key.
 */
export interface ModelSelection {
  /**
   * The registry key identifying the selected AI model.
   */
  readonly key: AiModelRegistryKey
}

/**
 * Defines a selection of a model route using its unique identifier.
 */
export interface RouteSelection {
  /**
   * The unique identifier of the selected model route.
   */
  readonly routeId: ModelRouteId
}
