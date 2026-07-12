import { describe, expect, test } from 'vitest'
import { renderFileSummary } from '../renderFileSummary.js'
import type { FileConceptInput } from '../../context/FileConceptInput.js'

describe('renderFileSummary', () => {
  test('renders a file with one exported symbol', () => {
    const input: FileConceptInput = {
      path: 'src/user/UserService.ts',
      exports: [
        {
          symbol: 'UserService',
          kind: 'class',
          summary: 'Handles user management.',
        },
      ],
    }

    expect(renderFileSummary(input)).toBe(`File path:
src/user/UserService.ts

Exported symbols:
- UserService (class)
  Summary:
  Handles user management.
`)
  })

  test('renders multiple exported symbols', () => {
    const input: FileConceptInput = {
      path: 'src/user/index.ts',
      exports: [
        {
          symbol: 'UserService',
          kind: 'class',
          summary: 'Handles user management.',
        },
        {
          symbol: 'UserRepository',
          kind: 'interface',
          summary: 'Defines the user repository contract.',
        },
      ],
    }

    expect(renderFileSummary(input)).toBe(`File path:
src/user/index.ts

Exported symbols:
- UserService (class)
  Summary:
  Handles user management.

- UserRepository (interface)
  Summary:
  Defines the user repository contract.
`)
  })

  test('renders when there are no exported symbols', () => {
    const input: FileConceptInput = {
      path: 'src/internal/helper.ts',
      exports: [],
    }

    expect(renderFileSummary(input)).toBe(`File path:
src/internal/helper.ts

Exported symbols:

`)
  })

  test('renders an exported symbol without a summary', () => {
    const input: FileConceptInput = {
      path: 'src/user/index.ts',
      exports: [
        {
          symbol: 'UserService',
          kind: 'class',
          summary: '',
        },
      ],
    }

    expect(renderFileSummary(input)).toBe(`File path:
src/user/index.ts

Exported symbols:
- UserService (class)
  Summary:
  
`)
  })
})
