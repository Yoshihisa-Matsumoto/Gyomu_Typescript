import { describe, expect, it, vi } from 'vitest'
import { Schema } from 'effect'
import { createResultSchema } from '@gyomu/schema'
import { toVercelTool } from '../to-vercel-tool.js'
import type { AiTool } from '../../ai-tool.js'

describe('toVercelTool', () => {
  it('forwards execute', async () => {
    const execute = vi.fn()
    const TestSchema = Schema.Struct({
      name: Schema.String,
    })
    const outputSchema = Schema.Struct({ message: Schema.String })
    const TestOutSchema = createResultSchema(outputSchema)
    const toolDef: AiTool<string, typeof TestSchema, typeof outputSchema> = {
      name: 'test',
      description: 'desc',

      inputSchema: TestSchema,

      execute,
    }

    const result = toVercelTool(toolDef)

    await result.execute?.(
      {
        name: 'x',
      },
      { messages: [], toolCallId: '' },
    )

    expect(execute).toHaveBeenCalledWith({
      name: 'x',
    })
  })
})
