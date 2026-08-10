/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { describe, expect, it, vi } from 'vitest'
import { Effect } from 'effect'
import { MessageRole } from '@gyomu/schema/conversation'
import { PlatformLayer } from '@gyomu/infra'
import { buildCodingGuidelineMessages } from '../buildCodingGuidelineMessages.js'
import type { LlmContextBuildContext } from '@gyomu/schema/concept'

vi.mock('../prompt/index.js', () => ({
  loadPrompt: vi.fn(() => Effect.succeed('coding guideline prompt')),
}))

const createContext = (): LlmContextBuildContext =>
  ({
    analysis: {},
    concept: {},
    knowledge: {
      codingGuideline: {
        principles: ['Use Effect Schema for domain models.', 'Keep business logic pure.'],
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
          'Do not introduce circular dependencies.',
          'Do not use provider-specific APIs outside infrastructure.',
        ],
      },
    },
  }) as unknown as LlmContextBuildContext

describe('buildCodingGuidelineMessages', () => {
  it('builds system and user messages', async () => {
    const messages = await Effect.runPromise(
      buildCodingGuidelineMessages(createContext()).pipe(Effect.provide(PlatformLayer)),
    )

    expect(messages).toHaveLength(2)

    expect(messages[0]).toEqual({
      id: '1',
      role: MessageRole.system,
      content: expect.stringContaining(
        'The purpose of this section is to provide practical rules that should be followed when',
      ),
    })

    expect(messages[1]).toMatchObject({
      id: '2',
      role: MessageRole.user,
    })
  })

  it('passes the coding guideline as user data', async () => {
    const context = createContext()

    const messages = await Effect.runPromise(
      buildCodingGuidelineMessages(context).pipe(Effect.provide(PlatformLayer)),
    )

    const userData = JSON.parse(messages[1]!.content)

    expect(userData).toEqual(context.knowledge.codingGuideline)
  })

  it('serializes the coding guideline as formatted JSON', async () => {
    const messages = await Effect.runPromise(
      buildCodingGuidelineMessages(createContext()).pipe(Effect.provide(PlatformLayer)),
    )

    expect(messages[1]!.content).toContain('\n')
    expect(messages[1]!.content).toContain('  "principles"')
    expect(messages[1]!.content).toContain('  "rules"')
    expect(messages[1]!.content).toContain('  "forbidden"')
  })

  it('preserves nested coding guideline data', async () => {
    const messages = await Effect.runPromise(
      buildCodingGuidelineMessages(createContext()).pipe(Effect.provide(PlatformLayer)),
    )

    const userData = JSON.parse(messages[1]!.content)

    expect(userData.rules).toEqual([
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
    ])

    expect(userData.forbidden).toEqual([
      'Do not introduce circular dependencies.',
      'Do not use provider-specific APIs outside infrastructure.',
    ])
  })
})
