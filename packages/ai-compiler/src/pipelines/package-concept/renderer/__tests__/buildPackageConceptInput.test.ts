import { describe, expect, it } from 'vitest'
import { ProjectRelativePath } from '@gyomu/schema/typescript'

import { buildPackageConceptInput } from '../buildPackageConceptInput.js'
import { createDirectory } from './helpers/createDirectory.js'
import { createPackageAnalysis } from './helpers/createPackageAnalysis.js'

describe('buildPackageConceptInput', () => {
  it('PackageConceptInputへ変換する', () => {
    const analysis = createPackageAnalysis({
      package: {
        name: 'sample-package',
        version: '2.0.0',
      },

      dependencies: [
        {
          source: 'dependency',
          packageName: 'effect',
          requestedVersion: '^4.0.0',
          resolvedVersion: '4.0.1',
          kind: 'version',
        },
        {
          source: 'devDependency',
          packageName: 'vitest',
          requestedVersion: '^3.0.0',
          resolvedVersion: '3.1.0',
          kind: 'version',
        },
      ],

      exports: [
        {
          exportPath: '.',
          exportedSymbols: [
            {
              name: 'Foo',
              summary: {
                summary: 'Foo summary',
                kind: 'const',
                symbol: 'Foo',
              },
              kind: 'const',
              sourceFile: ProjectRelativePath('ab'),
            },
            {
              name: 'Bar',
              summary: {
                summary: 'Bar summary',
                kind: 'const',
                symbol: 'Foo',
              },
              kind: 'const',
              sourceFile: ProjectRelativePath('ab'),
            },
          ],
        },
      ],

      directories: [
        createDirectory({
          path: ProjectRelativePath('src/core'),
          concept: {
            importance: 'Core',
            summary: 'Core summary',
            relationships: ['A', 'B'],
          },
          facts: {
            publicApiSymbolCount: 10,
            rootApiSymbolCount: 5,
          },
        }),
      ],
    })

    expect(buildPackageConceptInput(analysis)).toEqual({
      package: {
        name: 'sample-package',
        version: '2.0.0',
        private: false,
        type: 'module',
        license: 'MIT',
      },

      dependencies: [
        {
          packageName: 'effect',
          version: '4.0.1',
        },
      ],

      publicApi: [
        {
          exportPath: '.',
          symbols: [
            {
              name: 'Foo',
              summary: 'Foo summary',
            },
            {
              name: 'Bar',
              summary: 'Bar summary',
            },
          ],
        },
      ],

      topDirectories: [
        {
          importance: 'Core',
          path: ProjectRelativePath('src/core'),
          responsibilities: ['A', 'B'],
          summary: 'Core summary',
        },
      ],
    })
  })

  it('resolvedVersionがない場合はrequestedVersionを使用する', () => {
    const analysis = createPackageAnalysis({
      dependencies: [
        {
          source: 'dependency',
          packageName: 'effect',
          requestedVersion: '^4.0.0',
          kind: 'version',
        },
      ],
    })

    expect(buildPackageConceptInput(analysis).dependencies).toEqual([
      {
        packageName: 'effect',
        version: '^4.0.0',
      },
    ])
  })

  it('dependencyのみを対象とする', () => {
    const analysis = createPackageAnalysis({
      dependencies: [
        {
          source: 'dependency',
          packageName: 'effect',
          requestedVersion: '^4.0.0',
          kind: 'catalog',
        },
        {
          source: 'peerDependency',
          packageName: 'typescript',
          requestedVersion: '^6',
          kind: 'catalog',
        },
        {
          source: 'devDependency',
          packageName: 'vitest',
          requestedVersion: '^3',
          kind: 'catalog',
        },
      ],
    })

    expect(buildPackageConceptInput(analysis).dependencies).toEqual([
      {
        packageName: 'effect',
        version: '^4.0.0',
      },
    ])
  })
})
