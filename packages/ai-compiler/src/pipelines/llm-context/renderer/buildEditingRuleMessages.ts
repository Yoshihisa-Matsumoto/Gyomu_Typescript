import { Effect } from 'effect'
import { MessageRole } from '@gyomu/schema/conversation'
import { loadPrompt } from '../prompt/index.js'
// import { rankDirectoriesByImportance } from '../../../domain/rankDirectoriesByImportance.js'
import type { Message } from '@gyomu/schema/conversation'
import type { IOError } from '@gyomu/schema'
import type { LlmContextBuildContext } from '@gyomu/schema/concept'
import type { FileSystem } from 'effect'

/**
 * Builds LLM messages for editing rules based on the provided LLM context.
 *
 * @param context The LLM context build context containing coding guidelines.
 *
 * @returns An Effect yielding an array of messages, requiring FileSystem and potentially failing with an IOError.
 */
export const buildEditingRuleMessages = (
  context: LlmContextBuildContext,
): Effect.Effect<Array<Message>, IOError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const prompt = yield* loadPrompt('editing-rule.md')
    // const targetDirectories = rankDirectoriesByImportance(context.analysis.directories).slice(0, 5)
    const userData = {
      rules: context.knowledge.codingGuideline.rules,
      forbidden: context.knowledge.codingGuideline.forbidden,
    }
    return [
      { id: '1', role: MessageRole.system, content: prompt },
      { id: '2', role: MessageRole.user, content: JSON.stringify(userData, null, 2) },
    ]
  })
