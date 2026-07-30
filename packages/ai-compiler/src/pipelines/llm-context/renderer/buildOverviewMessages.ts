import { Effect } from 'effect'
import { MessageRole } from '@gyomu/schema/conversation'
import { loadPrompt } from '../prompt/index.js'
import type { Message } from '@gyomu/schema/conversation'
import type { IOError } from '@gyomu/schema'
import type { LlmContextBuildContext } from '@gyomu/schema/concept'
import type { FileSystem } from 'effect'

/**
 * Constructs the overview messages for the readme generation process, leveraging the project mission and concept summary.
 *
 * @param context The readme build context containing project knowledge and concept details.
 *
 * @returns An Effect containing an array of overview messages, requiring FileSystem access and potentially throwing an IOError.
 */
export const buildOverviewMessages = (
  context: LlmContextBuildContext,
): Effect.Effect<Array<Message>, IOError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const prompt = yield* loadPrompt('overview-generate.md')
    const userData = {
      mission: context.knowledge.package.mission,
      conceptSummary: context.concept.summary,
    }
    return [
      { id: '1', role: MessageRole.system, content: prompt },
      { id: '2', role: MessageRole.user, content: JSON.stringify(userData, null, 2) },
    ]
  })
