import { Effect } from 'effect'
import { loadPrompt } from '../../prompt/index.js'
import type { ConstraintsInput } from './ConstraintsInput.js'

/**
 * Renders constraint input data into a markdown representation using the important-constraints-input template.
 *
 * @param input The constraints input data containing human constraints, package facts, dependencies, export paths, and architecture facts.
 *
 * @returns An Effect containing the rendered markdown string.
 */
export const renderConstraintInputMarkdown = (input: ConstraintsInput) =>
  Effect.gen(function* () {
    const prompt = yield* loadPrompt('important-constraints-input.md')
    return prompt
      .replace('{{HUMAN_CONSTRAINTS}}', input.humanConstraints.map((c) => `- ${c}`).join('\n'))
      .replace(
        '{{PACKAGE_RESPONSIBILITIES}}',
        input.packageFacts.responsibilities.map((r) => `- ${r}`).join('\n'),
      )
      .replace(
        '{{RUNTIME_DEPENDENCIES}}',
        input.dependencyFacts.runtimeDependencies.map((d) => `- ${d}`).join('\n'),
      )
      .replace('{{EXPORT_PATHS}}', input.publicApiFacts.exportPaths.map((p) => `- ${p}`).join('\n'))
      .replace('{{TOTAL_EXPORTED_SYMBOLS}}', input.publicApiFacts.exportedSymbolCount.toString())
      .replace(
        '{{DIRECTORY_FACTS}}',
        input.architectureFacts.map((a) => dumpArchitectureFact(a)).join('\n\n'),
      )
  })

const dumpArchitectureFact = (fact: ConstraintsInput['architectureFacts'][number]) => {
  return `## ${fact.directory}

Responsibilities

${fact.responsibilities.map((r) => `- ${r}`).join('\n')}

Design Decisions

${fact.designDecisions.map((r) => `- ${r}`).join('\n')}

Relationships

${fact.relationships.map((r) => `- ${r}`).join('\n')}`
}
