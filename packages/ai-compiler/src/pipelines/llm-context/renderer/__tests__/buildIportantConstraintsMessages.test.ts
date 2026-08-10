import { describe, expect, it, vi } from 'vitest'
import { Effect } from 'effect'
import { MessageRole } from '@gyomu/schema/conversation'
import { PlatformLayer } from '@gyomu/infra'
import { buildImportantConstraintsMessages } from '../buildImportantConstraintsMessages.js'
import type { ConstraintsInput } from '../constraints/ConstraintsInput.js'
import type { LlmContextBuildContext } from '@gyomu/schema/concept'

const mocks = vi.hoisted(() => ({
  loadPrompt: vi.fn(),
  analyzePackageAnalysis: vi.fn(),
  renderConstraintInputMarkdown: vi.fn(),
}))

vi.mock('../../prompt/index.js', () => ({
  loadPrompt: mocks.loadPrompt,
}))

vi.mock('@gyomu/facts', () => ({
  analyzePackageAnalysis: mocks.analyzePackageAnalysis,
}))

vi.mock('../constraints/renderConstraintInputMarkdown.js', () => ({
  renderConstraintInputMarkdown: mocks.renderConstraintInputMarkdown,
}))

const createContext = (): LlmContextBuildContext =>
  ({
    analysis: {
      dependencies: [{ packageName: 'effect' }, { packageName: '@gyomu/schema' }],
      exports: [
        {
          exportPath: '.',
          exportedSymbols: [
            { sourceFile: 'src/index.ts', name: 'Foo' },
            { sourceFile: 'src/index.ts', name: 'Bar' },
          ],
        },
        {
          exportPath: './builder',
          exportedSymbols: [
            { sourceFile: 'src/builder.ts', name: 'Builder' },
            { sourceFile: 'src/index.ts', name: 'Foo' },
          ],
        },
      ],
    },
    concept: {
      summary: 'Package summary',
      responsibilities: ['Build concepts.', 'Maintain concepts.'],
      capabilities: ['Generate documentation.'],
    },
    knowledge: {
      package: {
        constraints: [
          'Do not couple generation and rendering.',
          'Do not depend on provider-specific APIs.',
        ],
      },
    },
  }) as unknown as LlmContextBuildContext

const directories = [
  {
    path: 'src/core',
    concept: {
      responsibilities: ['Build core functionality.'],
      relationships: ['Used by the builder.'],
      designDecisions: ['Keep the core independent.'],
    },
  },
  {
    path: 'src/supporting',
    concept: {
      responsibilities: ['Provide supporting functionality.'],
      relationships: ['Used by core.'],
      designDecisions: ['Keep supporting code isolated.'],
    },
  },
]

describe('buildImportantConstraintsMessages', () => {
  it('builds system and user messages', async () => {
    mocks.loadPrompt.mockReturnValue(Effect.succeed('important constraints prompt'))

    mocks.analyzePackageAnalysis.mockReturnValue({
      getRankedDirectories: vi.fn(() => directories),
    })

    mocks.renderConstraintInputMarkdown.mockReturnValue(Effect.succeed('rendered constraint input'))

    const messages = await Effect.runPromise(
      buildImportantConstraintsMessages(createContext()).pipe(Effect.provide(PlatformLayer)),
    )

    expect(messages).toHaveLength(2)

    expect(messages[0]).toEqual({
      id: '1',
      role: MessageRole.system,
      content: 'important constraints prompt',
    })

    expect(messages[1]).toEqual({
      id: '2',
      role: MessageRole.user,
      content: 'rendered constraint input',
    })
  })

  it('selects directories by importance', async () => {
    mocks.loadPrompt.mockReturnValue(Effect.succeed('important constraints prompt'))

    const getRankedDirectories = vi.fn(() => directories)

    mocks.analyzePackageAnalysis.mockReturnValue({
      getRankedDirectories,
    })

    mocks.renderConstraintInputMarkdown.mockReturnValue(Effect.succeed('rendered constraint input'))

    await Effect.runPromise(
      buildImportantConstraintsMessages(createContext()).pipe(Effect.provide(PlatformLayer)),
    )

    expect(getRankedDirectories).toHaveBeenCalledWith({
      strategy: 'importance',
      limits: {
        Core: 5,
        Supporting: 3,
        Utility: 0,
      },
    })
  })

  it('builds constraint input from package knowledge, concept, analysis, and directories', async () => {
    mocks.loadPrompt.mockReturnValue(Effect.succeed('important constraints prompt'))

    mocks.analyzePackageAnalysis.mockReturnValue({
      getRankedDirectories: vi.fn(() => directories),
    })

    mocks.renderConstraintInputMarkdown.mockReturnValue(Effect.succeed('rendered constraint input'))

    const context = createContext()

    await Effect.runPromise(
      buildImportantConstraintsMessages(context).pipe(Effect.provide(PlatformLayer)),
    )

    expect(mocks.renderConstraintInputMarkdown).toHaveBeenCalledWith({
      humanConstraints: context.knowledge.package.constraints,

      packageFacts: {
        responsibilities: context.concept.responsibilities,
        capabilities: context.concept.capabilities,
      },

      dependencyFacts: {
        runtimeDependencies: ['effect', '@gyomu/schema'],
      },

      publicApiFacts: {
        exportPaths: ['.', './builder'],
        exportedSymbolCount: 3,
      },

      architectureFacts: [
        {
          directory: 'src/core',
          responsibilities: ['Build core functionality.'],
          relationships: ['Used by the builder.'],
          designDecisions: ['Keep the core independent.'],
        },
        {
          directory: 'src/supporting',
          responsibilities: ['Provide supporting functionality.'],
          relationships: ['Used by core.'],
          designDecisions: ['Keep supporting code isolated.'],
        },
      ],
    } satisfies ConstraintsInput)
  })

  it('counts unique exported symbols across export paths', async () => {
    mocks.loadPrompt.mockReturnValue(Effect.succeed('important constraints prompt'))

    mocks.analyzePackageAnalysis.mockReturnValue({
      getRankedDirectories: vi.fn(() => []),
    })

    mocks.renderConstraintInputMarkdown.mockReturnValue(Effect.succeed('rendered constraint input'))

    await Effect.runPromise(
      buildImportantConstraintsMessages(createContext()).pipe(Effect.provide(PlatformLayer)),
    )

    const [input] = mocks.renderConstraintInputMarkdown.mock.calls[0] as [ConstraintsInput]

    expect(input.publicApiFacts.exportedSymbolCount).toBe(3)
  })

  it('passes only package names for runtime dependencies', async () => {
    mocks.loadPrompt.mockReturnValue(Effect.succeed('important constraints prompt'))

    mocks.analyzePackageAnalysis.mockReturnValue({
      getRankedDirectories: vi.fn(() => []),
    })

    mocks.renderConstraintInputMarkdown.mockReturnValue(Effect.succeed('rendered constraint input'))

    const context = createContext()

    await Effect.runPromise(
      buildImportantConstraintsMessages(context).pipe(Effect.provide(PlatformLayer)),
    )

    const [input] = mocks.renderConstraintInputMarkdown.mock.calls[0] as [ConstraintsInput]

    expect(input.dependencyFacts.runtimeDependencies).toEqual(['effect', '@gyomu/schema'])
  })
})
