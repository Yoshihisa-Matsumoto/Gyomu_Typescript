import { Effect } from 'effect'
import { MessageRole } from '@gyomu/schema/conversation'
import { analyzePackageAnalysis } from '@gyomu/facts'
import { loadPrompt } from '../prompt/index.js'
import type { Message } from '@gyomu/schema/conversation'
import type { IOError } from '@gyomu/schema'
import type { ReadmeBuildContext } from '@gyomu/schema/concept'
import type { FileSystem } from 'effect'

/**
 * Builds the system and user messages for the architecture documentation prompt using the provided build context.
 *
 * @param context The current README build context containing project analysis and concept details.
 *
 * @returns An Effect that yields an array of messages or an IOError, requiring a FileSystem service.
 *
 * @requires FileSystem.FileSystem
 */
export const buildArchitectureMessages = (
  context: ReadmeBuildContext,
): Effect.Effect<Array<Message>, IOError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const prompt = yield* loadPrompt('architecture-generate.md')
    const targetDirectories = analyzePackageAnalysis(context.analysis).getRankedDirectories({
      strategy: 'top-score',
      limit: 5,
    })
    const userData = {
      conceptSummary: context.concept.summary,
      responsibilities: context.concept.responsibilities,
      capabilities: context.concept.capabilities,
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
