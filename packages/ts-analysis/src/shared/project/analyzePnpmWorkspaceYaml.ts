import { join } from 'node:path'
import { Effect } from 'effect'
import { readYamlFromFile } from '@gyomu/infra/fs'
import type { FullPath } from '@gyomu/schema'
import type { WorkspaceDefinition } from './WorkspaceDefinition.js'

/**
 * Analyzes the pnpm-workspace.yaml file within the specified repository root and returns its content as a WorkspaceDefinition.
 *
 * @param repositoryRoot The absolute path to the root directory of the repository.
 *
 * @returns An Effect that yields the parsed WorkspaceDefinition.
 */
export const analyzePnpmWorkspaceYaml = (repositoryRoot: FullPath) => {
  return Effect.gen(function* () {
    return yield* readYamlFromFile<WorkspaceDefinition>(join(repositoryRoot, 'pnpm-workspace.yaml'))
  })
}
