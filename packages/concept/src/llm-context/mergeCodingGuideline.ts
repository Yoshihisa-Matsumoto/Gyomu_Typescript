import type { CodingGuideline } from '@gyomu/schema/schemas/knowledge'

/**
 * Merges a project-specific coding guideline with a base root guideline.
 *
 * @param root The base root coding guideline.
 *
 * @param project Optional project-specific coding guideline to merge.
 *
 * @returns The merged coding guideline containing rules, forbidden items, and principles from both sources.
 */
export const mergeCodingGuideline = (
  root: CodingGuideline,
  project?: CodingGuideline,
): CodingGuideline => {
  if (!project) return root

  return {
    displayName: project.displayName,
    rules: [...root.rules, ...project.rules],
    forbidden: [...root.forbidden, ...project.forbidden],
    principles: [...root.principles, ...project.principles],
  }
}
