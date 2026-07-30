import type { CodingGuideline } from '@gyomu/schema/schemas/knowledge'

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
