import type { AiTool } from '../tool/ai-tool.js'

/**
 * Defines the policy for determining when the tool execution loop should terminate. Supports limiting steps, waiting until a specific tool is called, or running until completion.
 */
export type ToolLoopPolicy =
  | {
      readonly type: 'maxSteps'

      readonly maxSteps: number
    }
  | {
      readonly type: 'untilToolCalled'

      readonly toolName: string
    }
  | {
      readonly type: 'untilFinished'
    }

/**
 * Defines the configuration for tool usage in an execution context. Can be empty, or contain a set of available tools and a mandatory loop policy.
 */
export type ToolConfig =
  | {
      readonly tools?: never
      readonly toolLoopPolicy?: never
    }
  | {
      readonly tools: ReadonlyArray<AiTool<any, any, any>>

      readonly toolLoopPolicy: ToolLoopPolicy
    }
