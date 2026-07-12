import { join } from 'node:path'
import { Effect } from 'effect'
import { readYamlFromFile } from '@gyomu/infra/fs'
import { FullPath } from '@gyomu/schema'
import { findWorkspaceRoot } from '../path/findWorkspaceRoot.js'
import type { WorkspaceDefinition } from './WorkspaceDefinition.js'

export const loadWorkspaceDefinition = (startDirectory: FullPath = FullPath(process.cwd())) => {
  return Effect.gen(function* () {
    const repositoryRoot = yield* findWorkspaceRoot(startDirectory)
    return yield* readYamlFromFile<WorkspaceDefinition>(join(repositoryRoot, 'pnpm-workspace.yaml'))
  })
}
