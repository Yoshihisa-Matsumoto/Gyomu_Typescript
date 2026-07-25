import type { AiModelRegistry } from '../model/AiModels.js'

/**
 * Represents a node in the routing tree, containing the AI model registry and configuration for retry logic.
 */
export interface RouteNode {
  /**
   * The registry of available AI models.
   */
  readonly registry: AiModelRegistry

  /**
   * The maximum number of retry attempts for operations performed at this node.
   */
  readonly retry: number
}
