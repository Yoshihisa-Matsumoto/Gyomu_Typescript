import { describe, expect, it, vi } from 'vitest'
import { Schema } from 'effect'

import { hasToolCall, isLoopFinished, stepCountIs } from 'ai'
import { buildToolRuntimeConfig } from '../buildToolRuntimeConfig.js'
import { toVercelTool } from '../../tool/adapter/to-vercel-tool.js'

vi.mock('ai', () => ({
  stepCountIs: vi.fn((count) => ({
    type: 'stepCountIs',
    count,
  })),

  hasToolCall: vi.fn((toolName) => ({
    type: 'hasToolCall',
    toolName,
  })),

  isLoopFinished: vi.fn(() => ({
    type: 'isLoopFinished',
  })),
}))

vi.mock('../../tool/adapter/to-vercel-tool.js', () => ({
  toVercelTool: vi.fn((tool) => ({
    wrapped: tool.name,
  })),
}))

describe('buildToolRuntimeConfig', () => {
  const tool = {
    name: 'weather',

    description: 'weather tool',

    inputSchema: Schema.Struct({
      city: Schema.String,
    }),

    execute: vi.fn(),
  }

  it('returns empty object when tools are undefined', () => {
    const result = buildToolRuntimeConfig({})

    expect(result).toEqual({})
  })

  it('maps tools using toVercelTool', () => {
    const result = buildToolRuntimeConfig({
      tools: [tool],

      toolLoopPolicy: {
        type: 'maxSteps',
        maxSteps: 5,
      },
    })

    expect(toVercelTool).toHaveBeenCalledWith(tool)

    expect(result.tools).toEqual({
      weather: {
        wrapped: 'weather',
      },
    })
  })

  it('builds maxSteps stopWhen', () => {
    const result = buildToolRuntimeConfig({
      tools: [tool],

      toolLoopPolicy: {
        type: 'maxSteps',
        maxSteps: 5,
      },
    })

    expect(stepCountIs).toHaveBeenCalledWith(5)

    expect(result.stopWhen).toEqual({
      type: 'stepCountIs',
      count: 5,
    })
  })

  it('builds untilToolCalled stopWhen', () => {
    const result = buildToolRuntimeConfig({
      tools: [tool],

      toolLoopPolicy: {
        type: 'untilToolCalled',
        toolName: 'weather',
      },
    })

    expect(hasToolCall).toHaveBeenCalledWith('weather')

    expect(result.stopWhen).toEqual({
      type: 'hasToolCall',
      toolName: 'weather',
    })
  })

  it('builds untilFinished stopWhen', () => {
    const result = buildToolRuntimeConfig({
      tools: [tool],

      toolLoopPolicy: {
        type: 'untilFinished',
      },
    })

    expect(isLoopFinished).toHaveBeenCalled()

    expect(result.stopWhen).toEqual({
      type: 'isLoopFinished',
    })
  })
})
