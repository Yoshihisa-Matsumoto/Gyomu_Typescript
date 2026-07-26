import { hasToolCall, isLoopFinished, stepCountIs } from 'ai'
import { toVercelTool } from '../../tool/adapter/vercel/to-vercel-tool.js'
import type { AiTool } from '../../tool/ai-tool.js'
import type { ToolLoopPolicy } from '../types/AiModelService.js'
import type { EffectSchema } from '@gyomu/schema/entity'

type AnyAiTool = AiTool<EffectSchema, any, any>

type ToolRuntimeConfig = {
  readonly tools?: Record<string, unknown>

  readonly stopWhen?: ReturnType<typeof stepCountIs>
}

/**
 * Creates a runtime configuration for AI tools, mapping tool definitions to Vercel formats and defining the tool execution loop termination policy.
 *
 * @param params Configuration object containing an optional list of AI tools and an optional tool loop policy.
 *
 * @returns Returns a ToolRuntimeConfig object containing the mapped tools and the stop criteria for tool loops.
 */
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
