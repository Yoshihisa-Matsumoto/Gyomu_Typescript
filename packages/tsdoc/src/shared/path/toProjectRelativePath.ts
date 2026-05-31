/**
 * Converts an absolute file path into a project-relative path.
 *
 * @remarks
 * The returned path always uses forward slashes (`/`) regardless of the
 * operating system to ensure stable identifiers and snapshots.
 *
 * Example:
 *
 * ```text
 * filePath:
 *   /workspace/project/src/user/UserService.ts
 *
 * projectRoot:
 *   /workspace/project
 *
 * result:
 *   src/user/UserService.ts
 * ```
 *
 * This path format is intended to be used as the canonical project-internal
 * path representation.
 */
export const toProjectRelativePath = (filePath: string, basePath: string): string => {
  const normalize = (p: string) => p.replace(/\\/g, '/').replace(/^[a-zA-Z]:/, '') // C: を除去

  const normalizedFile = normalize(filePath)
  const normalizedBase = normalize(basePath)

  // base削除
  const relative = normalizedFile.startsWith(normalizedBase)
    ? normalizedFile.slice(normalizedBase.length)
    : normalizedFile

  return relative.replace(/^\/+/, '') // 先頭スラッシュ除去
}
