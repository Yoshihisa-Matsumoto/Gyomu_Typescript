import { withErrorTraits } from '@gyomu/schema'
import { Data } from 'effect'
import type { ModelRouteId } from '../routing/ModelRouteId.js'
import type { AppErrorContext } from '@gyomu/schema'

/**
 * Defines the error context for a route not found error, containing the identifier of the missing route.
 */
export interface RouteNotFoundErrorContext extends AppErrorContext {
  /**
   * The unique identifier of the route that was not found.
   */
  readonly id: ModelRouteId
}

/**
 * Represents an error that occurs when a requested route cannot be found.
 */
export class RouteNotFoundError extends withErrorTraits(
  Data.TaggedError('@gyomu/ai/RouteNotFoundError')<RouteNotFoundErrorContext>,
  {
    isRetryable: () => false,
  },
) {}
