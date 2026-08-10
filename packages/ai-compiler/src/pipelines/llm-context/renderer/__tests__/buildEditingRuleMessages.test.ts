/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { describe, expect, it, vi } from 'vitest'
import { Effect } from 'effect'
import { MessageRole } from '@gyomu/schema/conversation'
import { PlatformLayer } from '@gyomu/infra'
import { buildEditingRuleMessages } from '../buildEditingRuleMessages.js'
import type { LlmContextBuildContext } from '@gyomu/schema/concept'

vi.mock('../prompt/index.js', () => ({
  loadPrompt: vi.fn(() => Effect.succeed('editing rule prompt')),
}))

const createContext = (): LlmContextBuildContext =>
  ({
    analysis: {},
    concept: {},
    knowledge: {
      codingGuideline: {
        rules: [
          {
            category: 'Schema',
            rule: 'Use Effect Schema for persisted data.',
            rationale: 'Keep the schema as the source of truth.',
          },
          {
            category: 'Testing',
            rule: 'Add tests when observable behavior changes.',
            rationale: 'Maintain behavioral correctness.',
          },
        ],
        forbidden: [
          'Do not introduce circular package dependencies.',
          'Do not use provider-specific APIs outside infrastructure.',
        ],
      },
    },
  }) as unknown as LlmContextBuildContext

describe('buildEditingRuleMessages', () => {
  it('builds system and user messages', async () => {
    const messages = await Effect.runPromise(
      buildEditingRuleMessages(createContext()).pipe(Effect.provide(PlatformLayer)),
    )

    expect(messages).toHaveLength(2)

    expect(messages[0]).toEqual({
      id: '1',
      role: MessageRole.system,
      content: expect.stringContaining(
        'Generate concise rules that guide an AI when modifying this package',
      ),
    })

    expect(messages[1]).toMatchObject({
      id: '2',
      role: MessageRole.user,
    })
  })

  it('includes rules and forbidden rules in the user message', async () => {
    const context = createContext()

    const messages = await Effect.runPromise(
      buildEditingRuleMessages(context).pipe(Effect.provide(PlatformLayer)),
    )

    const userData = JSON.parse(messages[1]!.content)

    expect(userData).toEqual({
      rules: context.knowledge.codingGuideline.rules,
      forbidden: context.knowledge.codingGuideline.forbidden,
    })
  })

  it('does not include unrelated coding guideline data', async () => {
    const context = createContext()

    const messages = await Effect.runPromise(
      buildEditingRuleMessages(context).pipe(Effect.provide(PlatformLayer)),
    )

    const userData = JSON.parse(messages[1]!.content)

    expect(userData).not.toHaveProperty('principles')
  })

  it('serializes the user data as formatted JSON', async () => {
    const messages = await Effect.runPromise(
      buildEditingRuleMessages(createContext()).pipe(Effect.provide(PlatformLayer)),
    )

    expect(messages[1]!.content).toContain('\n')
    expect(messages[1]!.content).toContain('  "rules"')
    expect(messages[1]!.content).toContain('  "forbidden"')
  })
})
