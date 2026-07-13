import { describe, expect, test } from 'vitest'
import { ProjectRelativePath } from '@gyomu/schema/typescript'
import { renderFileSummary } from '../renderFileSummary.js'
import type { FileSummary } from '@gyomu/schema/concept'

describe('renderFileSummary', () => {
  test('renders a file with one exported symbol', () => {
    const input: FileSummary = {
      path: ProjectRelativePath('src/user/UserService.ts'),
      exports: [
        {
          symbol: 'UserService',
          kind: 'class',
          summary: 'Handles user management.',
        },
      ],
      reExports: [],
      dependencies: [],
    }

    expect(renderFileSummary(input)).toBe(`File path:
src/user/UserService.ts

Exported symbols:
- UserService (class)
  Summary:
  Handles user management.
`)
  })
  test('renders a file with one reexported symbol', () => {
    const input: FileSummary = {
      path: ProjectRelativePath('src/user/UserService.ts'),
      exports: [],
      reExports: [{ exportAll: true, module: './service/index.js' }],
      dependencies: [],
    }
    const result = renderFileSummary(input)
    console.log(result)
    expect(result).toBe(`File path:
src/user/UserService.ts

Exported symbols:
- export * from "./service/index.js"
`)
  })

  test('renders multiple exported symbols', () => {
    const input: FileSummary = {
      path: ProjectRelativePath('src/user/index.ts'),
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
      reExports: [
        { exportAll: true, module: './service/index.js' },
        { exportAll: false, module: './help/index.js', symbol: 'helper' },
      ],
      dependencies: [],
    }
    const result = renderFileSummary(input)
    console.log(result)
    expect(result).toBe(`File path:
src/user/index.ts

Exported symbols:
- UserService (class)
  Summary:
  Handles user management.

- UserRepository (interface)
  Summary:
  Defines the user repository contract.

- export * from "./service/index.js"

- export helper from "./help/index.js"
`)
  })

  test('renders when there are no exported symbols', () => {
    const input: FileSummary = {
      path: ProjectRelativePath('src/internal/helper.ts'),
      exports: [],
      reExports: [],
      dependencies: [],
    }

    expect(renderFileSummary(input)).toBe(`File path:
src/internal/helper.ts

Exported symbols:

`)
  })

  test('renders an exported symbol without a summary', () => {
    const input: FileSummary = {
      path: ProjectRelativePath('src/user/index.ts'),
      exports: [
        {
          symbol: 'UserService',
          kind: 'class',
          summary: '',
        },
      ],
      reExports: [],
      dependencies: [],
    }
    const result = renderFileSummary(input)

    expect(result).toEqual(`File path:
src/user/index.ts

Exported symbols:
- UserService (class)
  Summary:
  
`)
  })
})
