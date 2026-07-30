import { Effect } from 'effect'
import { initializeDocumentBaseContext } from '../document/initializeDocumentBaseContext.js'
import type { DocumentBuilderError } from '../error/DocumentBuilderError.js'
import type { ConceptOptions } from '../ConceptOptions.js'
import type { FileSystem } from 'effect'
import type { ProjectContext } from '@gyomu/ts-analysis'
import type { ReadmeBuildContext } from '@gyomu/schema/concept'
import type { FileSearchService } from '@gyomu/schema/shared/fs'

/**
 * Initializes the build context required for documentation generation by aggregating package analysis, concept definitions, and various knowledge artifacts.
 *
 * @param context The project context containing project metadata.
 *
 * @param option Optional configuration for the concept build process.
 *
 * @returns An Effect that resolves to the initialized ReadmeBuildContext or fails with a DocumentBuilderError.
 *
 * @requires FileSystem.FileSystem | FileSearchService
 */
export const initializeReadmeBuildContext = (
  context: ProjectContext,
  option?: ConceptOptions,
): Effect.Effect<
  ReadmeBuildContext,
  DocumentBuilderError,
  FileSystem.FileSystem | FileSearchService
> =>
  Effect.gen(function* () {
    const baseContext = yield* initializeDocumentBaseContext(context, option)

    const resultContext = {
      ...baseContext.context,
    } satisfies ReadmeBuildContext
    return resultContext
  })
