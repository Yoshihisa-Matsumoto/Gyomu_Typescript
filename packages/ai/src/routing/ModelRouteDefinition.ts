import type { ModelRouteId } from './ModelRouteId.js'

/**
 * Defines a configuration object for a model route, containing a unique identifier and a descriptive text.
 */
export interface ModelRouteDefinition {
  /**
   * The unique identifier for the model route.
   */
  readonly id: ModelRouteId

  /**
   * A human-readable description of the route.
   */
  readonly description: string
}
