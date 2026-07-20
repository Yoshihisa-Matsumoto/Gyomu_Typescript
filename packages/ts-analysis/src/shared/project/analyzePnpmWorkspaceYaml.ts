import { join } from 'node:path'
import { Effect } from 'effect'
import { readYamlFromFile } from '@gyomu/infra/fs'
import type { FullPath } from '@gyomu/schema'
import type { WorkspaceDefinition } from './WorkspaceDefinition.js'

export const analyzePnpmWorkspaceYaml = (repositoryRoot: FullPath) => {
  return Effect.gen(function* () {
    return yield* readYamlFromFile<WorkspaceDefinition>(join(repositoryRoot, 'pnpm-workspace.yaml'))
  })
}
