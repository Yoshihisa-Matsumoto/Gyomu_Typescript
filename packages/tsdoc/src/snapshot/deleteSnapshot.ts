import { removePath } from '@gyomu/infra/fs'
import { Effect } from 'effect'
import { ensureProjectWorkspace } from './ensureProjectWorkspace.js'

export interface DeleteProjectSnapshotInput {
  readonly repoRoot: string
  readonly projectPath: string
}
export const deleteSnapshot = (input: DeleteProjectSnapshotInput) =>
  Effect.gen(function* () {
    const projectWorkspace = yield* ensureProjectWorkspace(input.repoRoot, input.projectPath)
    console.log(projectWorkspace.snapshotPath)
    yield* removePath(projectWorkspace.snapshotPath, { recursive: true })
  })
