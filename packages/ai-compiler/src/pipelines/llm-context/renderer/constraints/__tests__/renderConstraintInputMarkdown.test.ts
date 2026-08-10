import { describe, expect, it, vi } from 'vitest'
import { Effect } from 'effect'
import { PlatformLayer } from '@gyomu/infra'
import { renderConstraintInputMarkdown } from '../renderConstraintInputMarkdown.js'

vi.mock('../../prompt/index.js', () => ({
  loadPrompt: () =>
    Effect.succeed(`# Human Constraints

{{HUMAN_CONSTRAINTS}}

# Package Responsibilities

{{PACKAGE_RESPONSIBILITIES}}

# Dependency Facts

Runtime dependencies

{{RUNTIME_DEPENDENCIES}}

# Public API Facts

Export paths

{{EXPORT_PATHS}}

Total exported symbols

- {{TOTAL_EXPORTED_SYMBOLS}}

# Directory Facts

{{DIRECTORY_FACTS}}
`),
}))

describe('renderConstraintInputMarkdown', () => {
  it('renders markdown from constraint input', async () => {
    const markdown = await Effect.runPromise(
      renderConstraintInputMarkdown({
        humanConstraints: [
          'Do not couple analysis and rendering.',
          'Do not expose provider-specific APIs.',
        ],
        packageFacts: {
          responsibilities: ['Build Concept.', 'Maintain Concept.'],
          capabilities: [],
        },
        dependencyFacts: {
          runtimeDependencies: ['effect', '@gyomu/schema'],
        },
        publicApiFacts: {
          exportPaths: ['.', './builder'],
          exportedSymbolCount: 42,
        },
        architectureFacts: [
          {
            directory: 'src/builder',
            responsibilities: ['Build Concept.'],
            designDecisions: ['Separate rendering.'],
            relationships: ['Depends on analysis.'],
          },
        ],
      }).pipe(Effect.provide(PlatformLayer)),
    )

    expect(markdown).toContain('# Human Constraints')
    expect(markdown).toContain('- Do not couple analysis and rendering.')
    expect(markdown).toContain('- Do not expose provider-specific APIs.')

    expect(markdown).toContain('# Package Responsibilities')
    expect(markdown).toContain('- Build Concept.')
    expect(markdown).toContain('- Maintain Concept.')

    expect(markdown).toContain('# Dependency Facts')
    expect(markdown).toContain('- effect')
    expect(markdown).toContain('- @gyomu/schema')

    expect(markdown).toContain('# Public API Facts')
    expect(markdown).toContain('- .')
    expect(markdown).toContain('- ./builder')
    expect(markdown).toContain('- 42')

    expect(markdown).toContain('## src/builder')
    expect(markdown).toContain('Responsibilities')
    expect(markdown).toContain('- Build Concept.')
    expect(markdown).toContain('Design Decisions')
    expect(markdown).toContain('- Separate rendering.')
    expect(markdown).toContain('Relationships')
    expect(markdown).toContain('- Depends on analysis.')
  })
})
