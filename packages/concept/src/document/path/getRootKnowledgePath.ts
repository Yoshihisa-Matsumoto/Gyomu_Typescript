import { join } from 'node:path'
import { findWorkspaceRoot } from '@gyomu/ts-analysis'
import { Effect } from 'effect'
import { FullPath } from '@gyomu/schema'
import type { IOError } from '@gyomu/schema'
import type { ProjectContext } from '@gyomu/ts-analysis'
import type { FileSystem } from 'effect'
import type { ConceptOptions } from '../../ConceptOptions.js'

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
