import { Effect } from 'effect'
import { MessageRole } from '@gyomu/schema/conversation'
import { loadPrompt } from '../prompt/index.js'
// import { rankDirectoriesByImportance } from '../../../domain/rankDirectoriesByImportance.js'
import type { Message } from '@gyomu/schema/conversation'
import type { IOError } from '@gyomu/schema'
import type { LlmContextBuildContext } from '@gyomu/schema/concept'
import type { FileSystem } from 'effect'

/**
 * Builds design principles messages from the LLM context, incorporating policies, constraints, and rationale.
 *
 * @param context The LLM context build context containing knowledge policies, constraints, and rationale.
 *
 * @returns An Effect containing an array of messages, which may fail with an IOError and requires FileSystem.
 */
export const buildDesignPrinciplesMessages = (
  context: LlmContextBuildContext,
): Effect.Effect<Array<Message>, IOError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const prompt = yield* loadPrompt('design-principles.md')
    // const targetDirectories = rankDirectoriesByImportance(context.analysis.directories).slice(0, 5)
    const userData = {
      policies: context.knowledge.package.policies,
      constraints: context.knowledge.package.constraints,
      rationale: context.knowledge.package.rationale,
    }
    return [
      { id: '1', role: MessageRole.system, content: prompt },
      { id: '2', role: MessageRole.user, content: JSON.stringify(userData, null, 2) },
    ]
  })
