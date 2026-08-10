import { join } from 'node:path'
import { readJsonFromFileAndValidate, writeStringToFile } from '@gyomu/infra/fs'
import { FullPath } from '@gyomu/schema'
import { resolvePathWithinBase } from '@gyomu/schema/gyomu'
import { WorkspaceRelativePath } from '@gyomu/schema/typescript'
import { toProjectId } from '@gyomu/tsdoc'
import { Effect, FileSystem } from 'effect'
import { convertFromSchemaObjectToJsonWithEffect } from '@gyomu/schema/entity'
import { Checkpoint } from '../../schemas/Checkpoint.js'
import type { PipelineStep } from '../../schemas/Checkpoint.js'
import type { AnalyzeProjectChangesResult } from '@gyomu/tsdoc'

export const loadCheckpoint = (
  change: AnalyzeProjectChangesResult,
  projectName: string,
  repoRoot: FullPath,
  projectPath: WorkspaceRelativePath,
) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem

    const normalizedProjectPath = yield* resolvePathWithinBase(repoRoot, projectPath)

    const projectId = toProjectId(WorkspaceRelativePath(normalizedProjectPath))

    const projectRoot = FullPath(`.gyomu/checkpoint/${projectId}`)

    const checkFilePath = FullPath(join(projectRoot, 'Checkpoint.json'))

    yield* fs.makeDirectory(projectRoot, { recursive: true })

    if (change.diff.length > 0) return initializeCheckpoint(change, projectName)

    return yield* readJsonFromFileAndValidate('Checkpoint', Checkpoint, checkFilePath).pipe(
      Effect.catch(() => Effect.succeed(initializeCheckpoint(change, projectName))),
    )
  })

export const updateCheckpoint = (
  checkPoint: Checkpoint,
  repoRoot: FullPath,
  projectPath: WorkspaceRelativePath,
  statusToAdd: PipelineStep,
) => {
  const currentSteps = [...checkPoint.completedSteps]
  if (!currentSteps.includes(statusToAdd)) {
    currentSteps.push(statusToAdd)
  }

  const newCheckpoint: Checkpoint = {
    completedSteps: currentSteps,
    package: checkPoint.package,
    snapshotVersion: checkPoint.snapshotVersion,
    version: checkPoint.version,
  }

  return saveCheckpoint(newCheckpoint, repoRoot, projectPath)
}

export const saveCheckpoint = (
  checkPoint: Checkpoint,
  repoRoot: FullPath,
  projectPath: WorkspaceRelativePath,
) =>
  Effect.gen(function* () {
    const normalizedProjectPath = yield* resolvePathWithinBase(repoRoot, projectPath)

    const projectId = toProjectId(WorkspaceRelativePath(normalizedProjectPath))

    const projectRoot = FullPath(`.gyomu/checkpoint/${projectId}`)

    const checkFilePath = FullPath(join(projectRoot, 'Checkpoint.json'))

    const jsonString = yield* convertFromSchemaObjectToJsonWithEffect('Checkpoint')(
      Checkpoint,
      checkPoint,
    )

    yield* writeStringToFile(checkFilePath, jsonString)

    return checkPoint
  })

const initializeCheckpoint = (
  change: AnalyzeProjectChangesResult,
  projectName: string,
): Checkpoint => {
  return {
    version: 1,
    snapshotVersion: change.currentSnapshot.version,
    completedSteps: [],
    package: projectName,
  }
}
