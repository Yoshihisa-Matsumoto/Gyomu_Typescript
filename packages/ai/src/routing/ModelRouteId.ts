import { Brand } from 'effect'

/**
 * Represents a unique identifier for a model route, branded as a string.
 */
export type ModelRouteId = Brand.Branded<string, 'ModelRouteId'>

/**
 * A utility constant for nominal branding operations associated with the ModelRouteId type.
 */
export const ModelRouteId = Brand.nominal<ModelRouteId>()
