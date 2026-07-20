import type { AiTool } from '../tool/ai-tool.js'

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

export type ToolConfig =
  | {
      readonly tools?: never
      readonly toolLoopPolicy?: never
    }
  | {
      readonly tools: ReadonlyArray<AiTool<any, any, any>>

      readonly toolLoopPolicy: ToolLoopPolicy
    }
