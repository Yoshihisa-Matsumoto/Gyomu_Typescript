import { Effect, FileSystem } from 'effect'

import { FullPath, IOError, wrapInfraError } from '@gyomu/schema'

import { shortSha256 } from '@gyomu/infra/hash'
import { writeStringToFile } from '@gyomu/infra/fs'
import { resolvePathWithinBase } from '@gyomu/schema/gyomu'
import { GYOMU_VERSION } from './types/ProjectWorkspaceManifest.js'
import type { WorkspaceRelativePath } from '@gyomu/schema/typescript'

const toProjectId = (projectPath: string): string => {
  return shortSha256(projectPath)
}

/**
 * Represents a resolved and initialized Gyomu project workspace.
 *
 * This structure contains all filesystem paths required to perform
 * deterministic snapshot-based analysis for a single project within a repository.
 *
 * A workspace is created and managed by `ensureProjectWorkspace`, and acts as
 * the root context for all Gyomu operations such as:
 *
 * - Snapshot creation and persistence
 * - Change detection (diffing)
 * - TSDoc generation workflows
 *
 * @remarks
 * The workspace is uniquely identified by `projectId`, which is derived from
 * the normalized project path. This ensures stable identity across environments
 * (CI, local, and deployment).
 *
 * The directory structure is deterministic and versioned:
 *
 * ```
 * .gyomu/
 *   snapshot/
 *     <projectId>/
 *       manifest.json
 *       v1/
 *         file-hashes.json
 * ```
 *
 * @property projectId - Stable hashed identifier for the project (derived from normalized project path)
 * @property projectRoot - Root directory of the Gyomu workspace for this project
 * @property manifestPath - Path to the workspace manifest file containing metadata such as source path and version
 * @property snapshotPath - Path to the latest file hash snapshot used for change detection
 *
 * @see ensureProjectWorkspace
 */
export interface ProjectWorkspace {
  readonly projectId: string
  readonly projectRoot: string
  readonly manifestPath: string
  readonly snapshotPath: string
}

/**
 * Ensures and initializes a Gyomu project workspace inside a repository.
 *
 * This function is responsible for preparing all filesystem structures required
 * for Gyomu agent-based analysis workflows.
 *
 * It performs the following steps:
 *
 * 1. Validates and normalizes the project path within the repository boundary
 *    using `resolvePathWithinBase` (security enforcement).
 * 2. Derives a stable project identity (`projectId`) from the normalized path.
 * 3. Creates a dedicated workspace directory under `.gyomu/<projectId>`.
 * 4. Initializes versioned cache directories for TSDoc snapshot storage.
 * 5. Creates a manifest file if it does not already exist.
 *
 * The workspace structure is deterministic and safe for multi-project monorepos,
 * ensuring that project identity is stable across environments.
 *
 * Example structure:
 *
 * ```
 * .gyomu/
 *   snapshot/
 *     <projectId>/
 *       manifest.json
 *       v1/
 *         file-hashes.json
 * ```
 *
 * The manifest contains:
 *
 * - `id`: stable hashed project identifier
 * - `source`: normalized project path relative to repo root
 * - `createdAt`: workspace initialization timestamp
 * - `version`: Gyomu schema version
 *
 * @param repoRoot - Root directory of the monorepo (workspace boundary)
 * @param projectPath - Project path within the repository to initialize
 * @returns A `ProjectWorkspace` object containing resolved paths for further operations
 *
 * @remarks
 * This function enforces repository boundary safety via `resolvePathWithinBase`.
 * It is designed for agent execution environments where filesystem isolation
 * and deterministic project identity are required.
 *
 * Side effects:
 * - Creates directories under `.gyomu`
 * - Writes manifest file if missing
 */
export const ensureProjectWorkspace = (
  repoRoot: FullPath,
  projectPath: WorkspaceRelativePath,
): Effect.Effect<ProjectWorkspace, IOError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem

    const normalizedProjectPath = yield* resolvePathWithinBase(repoRoot, projectPath)

    const projectId = toProjectId(normalizedProjectPath)

    const projectRoot = FullPath(`${repoRoot}/.gyomu/snapshot/${projectId}`)

    const manifestPath = FullPath(`${projectRoot}/manifest.json`)

    const snapshotPath = FullPath(`${projectRoot}/v${GYOMU_VERSION}/file-hashes.json`)

    // 1. ensure directory
    yield* fs.makeDirectory(projectRoot, { recursive: true })
    yield* fs.makeDirectory(`${projectRoot}/v${GYOMU_VERSION}`, {
      recursive: true,
    })

    // 2. manifest init
    const exists = yield* fs.exists(manifestPath)

    if (!exists) {
      const manifest = {
        id: projectId,
        source: normalizedProjectPath,
        createdAt: new Date().toISOString(),
        version: GYOMU_VERSION,
      }

      yield* writeStringToFile(manifestPath, JSON.stringify(manifest, null, 2))
    }

    return {
      projectId,
      projectRoot,
      manifestPath,
      snapshotPath,
    }
  }).pipe(
    Effect.mapError((e) =>
      wrapInfraError(IOError, e, () => ({
        layer: 'filesystem' as const,
        message: 'fail to prepare project workspace',
        operation: 'write' as const,
      })),
    ),
  )
