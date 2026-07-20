import { withErrorTraits } from '@gyomu/schema'
import { Data } from 'effect'
import type { ModelRouteId } from '../routing/ModelRouteId.js'
import type { AppErrorContext } from '@gyomu/schema'

export interface RouteNotFoundErrorContext extends AppErrorContext {
  readonly id: ModelRouteId
}

export class RouteNotFoundError extends withErrorTraits(
  Data.TaggedError('@gyomu/ai/RouteNotFoundError')<RouteNotFoundErrorContext>,
  {
    isRetryable: () => false,
  },
) {}
