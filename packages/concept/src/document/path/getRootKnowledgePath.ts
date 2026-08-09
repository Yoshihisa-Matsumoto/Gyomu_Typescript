import { join } from 'node:path'
import { findWorkspaceRoot } from '@gyomu/ts-analysis'
import { Effect } from 'effect'
import { FullPath } from '@gyomu/schema'
import type { IOError } from '@gyomu/schema'
import type { ProjectContext } from '@gyomu/ts-analysis'
import type { FileSystem } from 'effect'
import type { ConceptOptions } from '../../ConceptOptions.js'

/**
 * Determines the absolute file system path for the root knowledge directory based on the project context and configuration options.
 *
 * @param context The current project context containing root directory information.
 *
 * @param option Optional settings for customizing the knowledge path resolution.
 *
 * @returns An Effect that yields the resolved FullPath, requiring FileSystem access and potentially failing with an IOError.
 */
export const getRootKnowledgePath = (
  context: ProjectContext,
  option?: ConceptOptions,
): Effect.Effect<FullPath, IOError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const repositoryRoot = yield* findWorkspaceRoot(context.projectRoot)
    return FullPath(
      join(
        repositoryRoot,
        option?.metadataRoot ??
          join('.gyomu', option?.action?.WriteToTempFolder ? 'cache' : 'knowledge'),
      ),
    )
  })
