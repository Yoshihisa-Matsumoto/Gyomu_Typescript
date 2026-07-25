import { Effect } from 'effect'
import { MessageRole } from '@gyomu/schema/conversation'
import { loadPrompt } from '../prompt/index.js'
import type { Message } from '@gyomu/schema/conversation'
import type { IOError } from '@gyomu/schema'
import type { ReadmeBuildContext } from '@gyomu/schema/concept'
import type { FileSystem } from 'effect'

export const buildDevelopmentMessages = (
  context: ReadmeBuildContext,
): Effect.Effect<Array<Message>, IOError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const prompt = yield* loadPrompt('development-assemble.md')
    const finalPrompt = prompt
      .replace('{{MISSION}}', context.knowledge.package.mission)
      .replace(
        '{{RESPONSIBILITIES}}',
        context.concept.responsibilities.map((r) => `- ${r}`).join('\n'),
      )
    return [{ id: '1', role: MessageRole.user, content: finalPrompt }]
  })
