import { Effect } from 'effect'
import { MessageRole } from '@gyomu/schema/conversation'
import { loadPrompt } from '../prompt/index.js'
import { selectTopDirectories } from '../../package-concept/renderer/selectTopDirectories.js'
import type { Message } from '@gyomu/schema/conversation'
import type { IOError } from '@gyomu/schema'
import type { ReadmeBuildContext } from '@gyomu/schema/concept'
import type { FileSystem } from 'effect'

export const buildArchitectureMessages = (
  context: ReadmeBuildContext,
): Effect.Effect<Array<Message>, IOError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const prompt = yield* loadPrompt('architecture-generate.md')
    const targetDirectories = selectTopDirectories(context.analysis.directories)
    const userData = {
      conceptSummary: context.concept.summary,
      responsibilities: context.concept.responsibilities,
      directories: targetDirectories.map((d) => ({
        path: d.path,
        summary: d.concept.summary,
        responsibilities: d.concept.responsibilities,
        relationships: d.concept.relationships,
      })),
    }
    return [
      { id: '1', role: MessageRole.system, content: prompt },
      { id: '2', role: MessageRole.user, content: JSON.stringify(userData, null, 2) },
    ]
  })
