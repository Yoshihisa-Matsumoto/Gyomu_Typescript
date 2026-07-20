import type { NonEmptyReadonlyArray } from 'effect/Array'
import type { RouteNode } from './RouteNode.js'

export interface ModelRoute {
  readonly nodes: NonEmptyReadonlyArray<RouteNode>
}
