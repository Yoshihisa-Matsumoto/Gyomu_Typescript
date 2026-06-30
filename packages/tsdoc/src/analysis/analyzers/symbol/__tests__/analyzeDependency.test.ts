import { describe, expect, it } from 'vitest'
import { analyzeDependency } from '../analyzeDependency.js'
import type { ImportAnalysis } from '@gyomu/schema/typescript'

describe('analyzeDependency', () => {
  it('returns local-file dependency when identifier is not imported', () => {
    const imports: Array<ImportAnalysis> = []

    expect(analyzeDependency('User', imports, [])).toEqual({
      source: {
        memberPath: [],
      },
      target: {
        scope: 'local-file',
        symbolName: 'User',
      },
    })
  })

  it('returns import dependency when identifier matches imported local name', () => {
    const imports: Array<ImportAnalysis> = [
      {
        moduleSpecifier: './user.js',
        importedName: 'User',
        localName: 'User',
        isTypeOnly: false,
        kind: 'named',
      },
    ]

    expect(analyzeDependency('User', imports, ['save'])).toEqual({
      source: {
        memberPath: ['save'],
      },
      target: {
        scope: 'import',
        localName: 'User',
      },
    })
  })

  it('uses local name for aliased imports', () => {
    const imports: Array<ImportAnalysis> = [
      {
        moduleSpecifier: './user.js',
        importedName: 'User',
        localName: 'Person',
        isTypeOnly: false,
        kind: 'named',
      },
    ]

    expect(analyzeDependency('Person', imports, ['constructor'])).toEqual({
      source: {
        memberPath: ['constructor'],
      },
      target: {
        scope: 'import',
        localName: 'Person',
      },
    })
  })
})
