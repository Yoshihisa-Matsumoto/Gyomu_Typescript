import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { FileSearchServiceLayer, copyFolder, emptyDir } from '@gyomu/infra/fs'
import { Effect, Result } from 'effect'
import { expect, it } from 'vitest'
import { PlatformLayer, makeRunner } from '@gyomu/infra'
import { GyomuError, logger } from '@gyomu/schema'
import { makeRunnerAsReturn } from '@gyomu/schema/effect'
import { analyzeProjectChanges } from '../analyzeProjectChanges.js'
import { commitProjectSnapshot } from '../commitProjectSnapshot.js'
import { GYOMU_VERSION } from '../types/ProjectWorkspaceManifest.js'

const TestCategory = 'analyze-project-changes'

const getTempDirectory = (initializeRootPath: boolean = false) => {
  const targetDirectory = join(tmpdir(), TestCategory)
  const srcDirectory = join(targetDirectory, 'src')
  return emptyDir(initializeRootPath ? targetDirectory : srcDirectory).pipe(
    Effect.map(() => targetDirectory),
  )
}
const prepareTestWorkspace = (mode: 'initialized' | 'updated' | 'added' | 'deleted') => {
  return Effect.gen(function* () {
    const rootPath = yield* getTempDirectory(mode == 'initialized')
    const srcFolder = join('./test-fixtures', TestCategory, mode)
    yield* copyFolder(srcFolder, rootPath, { overwrite: true })

    return rootPath
  })
}

it('analyzeProjectChange integration test', async () => {
  const program = Effect.gen(function* () {
    const rootPath = yield* prepareTestWorkspace('initialized')

    const result = yield* analyzeProjectChanges({ repoRoot: rootPath, projectPath: rootPath })
    logger.debug(result, 'analyzeProjectChange initialized')
    expect(result.previousSnapshot).toBeNull()
    const initialStatus = result.currentSnapshot
    let diff = result.diff
    expect(diff.length).toBe(1)

    yield* commitProjectSnapshot({
      expectedSnapshot: initialStatus,
      projectPath: rootPath,
      repoRoot: rootPath,
    })

    yield* prepareTestWorkspace('updated')
    const resultUpdated = yield* analyzeProjectChanges({
      repoRoot: rootPath,
      projectPath: rootPath,
    })
    expect(resultUpdated.previousSnapshot).toBeDefined()
    expect(resultUpdated.previousSnapshot).toEqual(initialStatus)
    diff = resultUpdated.diff
    expect(diff.length).toBe(1)
    expect(diff[0]?.type).toBe('updated')
    const updatedStatus = resultUpdated.currentSnapshot

    yield* commitProjectSnapshot({
      expectedSnapshot: updatedStatus,
      projectPath: rootPath,
      repoRoot: rootPath,
    })

    yield* prepareTestWorkspace('added')
    const resultAdded = yield* analyzeProjectChanges({
      repoRoot: rootPath,
      projectPath: rootPath,
    })
    expect(resultAdded.previousSnapshot).toBeDefined()
    expect(resultAdded.previousSnapshot).toEqual(updatedStatus)
    diff = resultAdded.diff
    expect(diff.length).toBe(1)
    expect(diff[0]?.type).toBe('added')
    const addedStatus = resultAdded.currentSnapshot

    yield* commitProjectSnapshot({
      expectedSnapshot: addedStatus,
      projectPath: rootPath,
      repoRoot: rootPath,
    })

    yield* prepareTestWorkspace('deleted')
    const resultDeleted = yield* analyzeProjectChanges({
      repoRoot: rootPath,
      projectPath: rootPath,
    })
    expect(resultDeleted.previousSnapshot).toBeDefined()
    expect(resultDeleted.previousSnapshot).toEqual(addedStatus)
    diff = resultDeleted.diff
    expect(diff.length).toBe(1)
    expect(diff[0]?.type).toBe('deleted')
    const deletedStatus = resultDeleted.currentSnapshot

    yield* commitProjectSnapshot({
      expectedSnapshot: deletedStatus,
      projectPath: rootPath,
      repoRoot: rootPath,
    })
  })

  const runner = await makeRunner(PlatformLayer)(program, FileSearchServiceLayer)
})
it('analyzeProjectChange integration concurrency test', async () => {
  const program = Effect.gen(function* () {
    const rootPath = yield* prepareTestWorkspace('initialized')

    const result = yield* analyzeProjectChanges({ repoRoot: rootPath, projectPath: rootPath })
    logger.debug(result, 'analyzeProjectChange initialized')
    expect(result.previousSnapshot).toBeNull()
    const initialStatus = result.currentSnapshot
    const diff = result.diff
    expect(diff.length).toBe(1)

    yield* commitProjectSnapshot({
      expectedSnapshot: { version: GYOMU_VERSION, files: [] },
      projectPath: rootPath,
      repoRoot: rootPath,
    })
  })

  const runner = await makeRunnerAsReturn(PlatformLayer)(program, FileSearchServiceLayer)
  expect(Result.isFailure(runner)).toBeTruthy()
  if (Result.isFailure(runner)) {
    const err = runner.failure
    expect(err instanceof GyomuError).toBeTruthy()
    const err2: GyomuError = err as GyomuError
    expect(err2.reason).toBe('concurrent_modification')
  }
})
