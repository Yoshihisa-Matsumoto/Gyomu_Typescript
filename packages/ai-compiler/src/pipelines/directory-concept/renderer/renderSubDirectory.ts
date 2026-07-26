import type { DirectoryConcept } from '@gyomu/schema/schemas/concept'
import type { DirectoryRelativePath } from '@gyomu/schema/typescript'

/**
 * Renders a directory concept into a formatted string representation.
 *
 * @param dir The directory path and its associated conceptual definition.
 *
 * @returns A string containing the formatted directory metadata.
 */
export const renderSubDirectory = (dir: {
  path: DirectoryRelativePath
  concept: DirectoryConcept
}) => {
  return `Directory:
${dir.path}

Importance:
${dir.concept.importance}

Summary:
${dir.concept.summary}

Responsibilities:
${dir.concept.responsibilities.join(', ')}

Concepts:
${dir.concept.concepts.join(', ')}

Relationships:
${dir.concept.relationships.join(', ')}

Design decisions:
${dir.concept.designDecisions.join(', ')}
`
}
