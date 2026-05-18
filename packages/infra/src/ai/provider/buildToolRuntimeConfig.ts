import { hasToolCall, isLoopFinished, stepCountIs } from 'ai'
import { toVercelTool } from '../tool/adapter/to-vercel-tool.js'
import type { AiTool } from '../tool/ai-tool.js'
import type { ToolLoopPolicy } from '../service/AiService.js'

type AnyAiTool = AiTool<string, any, any>

type ToolRuntimeConfig = {
  readonly tools?: Record<string, unknown>

  readonly stopWhen?: ReturnType<typeof stepCountIs>
}
export const buildToolRuntimeConfig = (params: {
  readonly tools?: ReadonlyArray<AnyAiTool>

  readonly toolLoopPolicy?: ToolLoopPolicy | undefined
}): ToolRuntimeConfig => {
  if (!params.tools || !params.toolLoopPolicy) {
    return {}
  }

  const tools = Object.fromEntries(
    params.tools.map((toolDef) => [toolDef.name, toVercelTool(toolDef)]),
  )

  const stopWhen = (() => {
    const policy = params.toolLoopPolicy

    switch (policy.type) {
      case 'maxSteps':
        return stepCountIs(policy.maxSteps)

      case 'untilToolCalled':
        return hasToolCall(policy.toolName)

      case 'untilFinished':
        return isLoopFinished()
    }
  })()

  return {
    tools,
    stopWhen,
  }
}
