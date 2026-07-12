import { describe, expect, it } from 'vitest'
import { DirectoryRelativePath } from '@gyomu/schema/typescript'
import { renderSubDirectory } from '../renderSubDirectory.js'

describe('renderSubDirectory', () => {
  it('renders a child directory concept', () => {
    const result = renderSubDirectory({
      path: DirectoryRelativePath('./core'),
      concept: {
        summary: 'Provides the core domain model.',
        responsibilities: ['Manage domain models', 'Provide shared business logic'],
        concepts: ['Entity', 'Value Object'],
        relationships: ['Entities reference Value Objects.'],
        designDecisions: ['Domain logic is isolated from infrastructure.'],
      },
    })

    expect(result).toBe(`Directory:
./core

Summary:
Provides the core domain model.

Responsibilities:
Manage domain models, Provide shared business logic

Concepts:
Entity, Value Object

Relationships:
Entities reference Value Objects.

Design decisions:
Domain logic is isolated from infrastructure.
`)
  })
})
