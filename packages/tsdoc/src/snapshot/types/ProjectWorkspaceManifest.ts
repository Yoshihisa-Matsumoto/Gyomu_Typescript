export const GYOMU_VERSION = 1 as const
export type GyomuVersion = typeof GYOMU_VERSION
/**
 * Workspace-level metadata for a project tracked by the system.
 *
 * This manifest represents a stable identity for a project within the
 * `.gyomu` workspace structure.
 *
 * It is used to:
 * - Bind a project path to a stable internal project ID
 * - Manage cached analysis artifacts
 * - Support multi-project monorepo tracking
 *
 * `createdAt` represents the first time this project was registered
 * in the `.gyomu` workspace, not the filesystem creation time.
 */
export interface ProjectWorkspaceManifest {
  id: string
  source: string
  createdAt: string
  version: GyomuVersion
}
