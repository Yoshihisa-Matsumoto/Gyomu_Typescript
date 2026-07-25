import { Effect } from 'effect'
import { MessageRole } from '@gyomu/schema/conversation'
import { loadPrompt } from '../prompt/index.js'
import type { Message } from '@gyomu/schema/conversation'
import type { IOError } from '@gyomu/schema'
import type { ReadmeBuildContext } from '@gyomu/schema/concept'
import type { FileSystem } from 'effect'

export const buildOverviewMessages = (
  context: ReadmeBuildContext,
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
