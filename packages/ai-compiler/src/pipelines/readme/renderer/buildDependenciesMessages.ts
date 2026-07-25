import { Effect } from 'effect'
import { MessageRole } from '@gyomu/schema/conversation'
import { loadPrompt } from '../prompt/index.js'
import type { Message } from '@gyomu/schema/conversation'
import type { IOError } from '@gyomu/schema'
import type { ReadmeBuildContext } from '@gyomu/schema/concept'
import type { FileSystem } from 'effect'

export const buildDependenciesMessages = (
  context: ReadmeBuildContext,
): Effect.Effect<Array<Message>, IOError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const systemPrompt = yield* loadPrompt('dependencies-assemble.md')
    const dependencies = {
      dependencies: context.knowledge.technical.dependencies,
      compatibility: context.knowledge.technical.compatibility,
    }
    return [
      { id: '1', role: MessageRole.system, content: systemPrompt },
      { id: '2', role: MessageRole.user, content: JSON.stringify(dependencies, null, 2) },
    ]
  })
