import { Effect } from 'effect'
import { MessageRole } from '@gyomu/schema/conversation'
import { loadPrompt } from '../prompt/index.js'
import type { Message } from '@gyomu/schema/conversation'
import type { IOError } from '@gyomu/schema'
import type { ReadmeBuildContext } from '@gyomu/schema/concept'
import type { FileSystem } from 'effect'

/**
 * Constructs the development messages prompt by populating the 'development-assemble.md' template with context-specific mission and responsibilities.
 *
 * @param context The build context containing the mission and concept responsibilities.
 *
 * @returns An Effect that resolves to an array of messages or fails with an IOError, requiring FileSystem access.
 */
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
      .replace('{{POLICY}}', context.knowledge.package.policies.join('\n'))
    return [{ id: '1', role: MessageRole.user, content: finalPrompt }]
  })
