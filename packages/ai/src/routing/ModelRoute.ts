import type { NonEmptyReadonlyArray } from 'effect/Array'
import type { RouteNode } from './RouteNode.js'

/**
 * Defines a route configuration consisting of a non-empty list of route nodes.
 */
export interface ModelRoute {
  /**
   * The ordered sequence of nodes that constitute the route.
   */
  readonly nodes: NonEmptyReadonlyArray<RouteNode>
}
