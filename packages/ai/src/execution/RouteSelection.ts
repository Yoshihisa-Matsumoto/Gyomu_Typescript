import type { AiModelRegistryKey } from '../model/AiModels.js'
import type { ModelRouteId } from '../routing/ModelRouteId.js'

export interface ModelSelection {
  readonly key: AiModelRegistryKey
}

export interface RouteSelection {
  readonly routeId: ModelRouteId
}
