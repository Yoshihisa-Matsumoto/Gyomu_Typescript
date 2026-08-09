import { Effect } from 'effect'
import { MessageRole } from '@gyomu/schema/conversation'
import { analyzePackageAnalysis } from '@gyomu/facts'
import { loadPrompt } from '../prompt/index.js'
// import { rankDirectoriesByImportance } from '../../../domain/rankDirectoriesByImportance.js'
import { renderConstraintInputMarkdown } from './constraints/renderConstraintInputMarkdown.js'
import type { ConstraintsInput } from './constraints/ConstraintsInput.js'
import type { Message } from '@gyomu/schema/conversation'
import type { IOError } from '@gyomu/schema'
import type { LlmContextBuildContext } from '@gyomu/schema/concept'
import type { FileSystem } from 'effect'

/**
 * Builds important constraint messages for the LLM context using package analysis, constraints, and architecture facts, requiring FileSystem access.
 *
 * @param context The LLM context build context containing analysis, concept, and knowledge.
 *
 * @returns An Effect containing an array of messages, with possible IOError failure and requiring FileSystem.
 */
export const buildImportantConstraintsMessages = (
  context: LlmContextBuildContext,
): Effect.Effect<Array<Message>, IOError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const prompt = yield* loadPrompt('important-constraints.md')
    // const targetDirectories = rankDirectoriesByImportance(context.analysis.directories).slice(0, 5)
    const directories = analyzePackageAnalysis(context.analysis).getRankedDirectories({
      strategy: 'importance',
      limits: { Core: 5, Supporting: 3, Utility: 0 },
    })

    const userData: ConstraintsInput = {
      humanConstraints: context.knowledge.package.constraints,
      packageFacts: {
        responsibilities: context.concept.responsibilities,
        capabilities: context.concept.capabilities,
      },
      dependencyFacts: {
        runtimeDependencies: context.analysis.dependencies.map(
          (dependency) => dependency.packageName,
        ),
      },
      publicApiFacts: {
        exportPaths: context.analysis.exports.map((exp) => exp.exportPath),
        exportedSymbolCount: new Set<string>(
          context.analysis.exports
            .map((exp) => exp.exportedSymbols.map((sym) => sym.sourceFile + ':' + sym.name))
            .flat(),
        ).size,
      },

      architectureFacts: directories.map((directory) => ({
        directory: directory.path,
        designDecisions: directory.concept.designDecisions,
        relationships: directory.concept.relationships,
        responsibilities: directory.concept.responsibilities,
      })),
    }
    const renderedUserData = yield* renderConstraintInputMarkdown(userData)
    return [
      { id: '1', role: MessageRole.system, content: prompt },
      { id: '2', role: MessageRole.user, content: renderedUserData },
    ]
  })
