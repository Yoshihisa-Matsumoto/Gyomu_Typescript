import type { DirectoryRelativePath } from '@gyomu/schema/typescript'
import type { DirectoryConcept } from '../schema/DirectoryConcept.js'

export const renderSubDirectory = (dir: {
  path: DirectoryRelativePath
  concept: DirectoryConcept
}) => {
  return `Directory:
${dir.path}

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
