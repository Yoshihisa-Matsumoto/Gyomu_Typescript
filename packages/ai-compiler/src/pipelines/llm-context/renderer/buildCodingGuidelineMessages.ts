import { Effect } from 'effect'
import { MessageRole } from '@gyomu/schema/conversation'
import { loadPrompt } from '../prompt/index.js'
// import { rankDirectoriesByImportance } from '../../../domain/rankDirectoriesByImportance.js'
import type { Message } from '@gyomu/schema/conversation'
import type { IOError } from '@gyomu/schema'
import type { LlmContextBuildContext } from '@gyomu/schema/concept'
import type { FileSystem } from 'effect'

/**
 * Builds coding guideline messages for the LLM context using the provided build context.
 *
 * @param context The LLM context build information.
 *
 * @returns Returns an Effect containing an array of messages representing the coding guidelines, requiring FileSystem and potentially failing with an IOError.
 */
export const buildCodingGuidelineMessages = (
  context: LlmContextBuildContext,
): Effect.Effect<Array<Message>, IOError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const prompt = yield* loadPrompt('coding-guidelines.md')
    // const targetDirectories = rankDirectoriesByImportance(context.analysis.directories).slice(0, 5)
    const userData = context.knowledge.codingGuideline
    return [
      { id: '1', role: MessageRole.system, content: prompt },
      { id: '2', role: MessageRole.user, content: JSON.stringify(userData, null, 2) },
    ]
  })
