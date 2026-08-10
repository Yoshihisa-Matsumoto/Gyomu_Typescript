/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { describe, expect, it, vi } from 'vitest'
import { Effect } from 'effect'
import { MessageRole } from '@gyomu/schema/conversation'
import { PlatformLayer } from '@gyomu/infra'
import { buildDesignPrinciplesMessages } from '../buildDesignPrinciplesMessages.js'
import type { LlmContextBuildContext } from '@gyomu/schema/concept'

vi.mock('../prompt/index.js', () => ({
  loadPrompt: vi.fn(() => Effect.succeed('design principles prompt')),
}))

const createContext = (): LlmContextBuildContext =>
  ({
    analysis: {},
    concept: {},
    knowledge: {
      package: {
        policies: [
          'Treat Concept as the canonical structured knowledge model.',
          'Keep Concept independent of output formats.',
        ],
        constraints: [
          'Do not couple Concept generation with Markdown rendering.',
          'Do not depend on editor-specific features.',
        ],
        rationale: [
          'Concept can be reused for multiple outputs.',
          'Separating generation and rendering allows independent evolution.',
        ],
      },
    },
  }) as unknown as LlmContextBuildContext

describe('buildDesignPrinciplesMessages', () => {
  it('builds system and user messages', async () => {
    const messages = await Effect.runPromise(
      buildDesignPrinciplesMessages(createContext()).pipe(Effect.provide(PlatformLayer)),
    )

    expect(messages).toHaveLength(2)

    expect(messages[0]).toEqual({
      id: '1',
      role: MessageRole.system,
      content: expect.stringContaining(
        'The purpose of this section is to explain the fundamental design',
      ),
    })

    expect(messages[1]).toMatchObject({
      id: '2',
      role: MessageRole.user,
    })
  })

  it('includes policies, constraints, and rationale in the user message', async () => {
    const context = createContext()

    const messages = await Effect.runPromise(
      buildDesignPrinciplesMessages(context).pipe(Effect.provide(PlatformLayer)),
    )

    const userData = JSON.parse(messages[1]!.content)

    expect(userData).toEqual({
      policies: context.knowledge.package.policies,
      constraints: context.knowledge.package.constraints,
      rationale: context.knowledge.package.rationale,
    })
  })

  it('does not include unrelated package knowledge', async () => {
    const context = createContext()

    const messages = await Effect.runPromise(
      buildDesignPrinciplesMessages(context).pipe(Effect.provide(PlatformLayer)),
    )

    const userData = JSON.parse(messages[1]!.content)

    expect(userData).not.toHaveProperty('mission')
    expect(userData).not.toHaveProperty('nonGoals')
    expect(userData).not.toHaveProperty('terminology')
    expect(userData).not.toHaveProperty('usage')
    expect(userData).not.toHaveProperty('examples')
  })

  it('serializes the user data as formatted JSON', async () => {
    const messages = await Effect.runPromise(
      buildDesignPrinciplesMessages(createContext()).pipe(Effect.provide(PlatformLayer)),
    )

    expect(messages[1]!.content).toContain('\n')
    expect(messages[1]!.content).toContain('  "policies"')
    expect(messages[1]!.content).toContain('  "constraints"')
    expect(messages[1]!.content).toContain('  "rationale"')
  })
})
