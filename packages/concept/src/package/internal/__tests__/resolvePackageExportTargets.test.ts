import { describe, expect, it } from 'vitest'
import { resolvePackageExportTargets } from '../resolvePackageExportTargets.js'
import type { PackageExportEntry } from '@gyomu/schema/typescript'

describe('resolvePackageExportTargets', () => {
  it('resolves import target', () => {
    const result = resolvePackageExportTargets(
      [
        {
          exportPath: '.',
          targets: [
            {
              condition: 'import',
              target: './dist/index.js',
            },
          ],
          wildcard: false,
        } satisfies PackageExportEntry,
      ],
      {
        rootDir: './src',
        outDir: './dist',
      },
      '/project' as any,
    )

    expect(result).toEqual(
      expect.arrayContaining([
        {
          exportPath: '.',
          sourceFile: 'src/index.ts',
        },
      ]),
    )
  })

  it('uses unconditional target when import target is absent', () => {
    const result = resolvePackageExportTargets(
      [
        {
          exportPath: '.',
          targets: [
            {
              condition: undefined,
              target: './dist/index.js',
            },
          ],
          wildcard: false,
        },
      ],
      {
        rootDir: 'src',
        outDir: 'dist',
      },
      '/project' as any,
    )

    expect(result).toEqual(
      expect.arrayContaining([
        {
          exportPath: '.',
          sourceFile: 'src/index.ts',
        },
      ]),
    )
  })

  it('returns empty when no usable target exists', () => {
    const result = resolvePackageExportTargets(
      [
        {
          exportPath: '.',
          targets: [
            {
              condition: 'require',
              target: './dist/index.cjs',
            },
          ],
          wildcard: false,
        },
      ],
      {
        rootDir: 'src',
        outDir: 'dist',
      },
      '/project' as any,
    )

    expect(result).toEqual([])
  })

  it('returns empty when rootDir is undefined', () => {
    const result = resolvePackageExportTargets(
      [
        {
          exportPath: '.',
          targets: [
            {
              condition: undefined,
              target: './dist/index.js',
            },
          ],
          wildcard: false,
        },
      ],
      {
        rootDir: undefined,
        outDir: 'dist',
      },
      '/project' as any,
    )

    expect(result).toEqual([])
  })

  it('returns empty when outDir is undefined', () => {
    const result = resolvePackageExportTargets(
      [
        {
          exportPath: '.',
          targets: [
            {
              condition: undefined,
              target: './dist/index.js',
            },
          ],
          wildcard: false,
        },
      ],
      {
        rootDir: 'src',
        outDir: undefined,
      },
      '/project' as any,
    )

    expect(result).toEqual([])
  })

  it('resolves multiple exports', () => {
    const result = resolvePackageExportTargets(
      [
        {
          exportPath: '.',
          targets: [
            {
              condition: undefined,
              target: './dist/index.js',
            },
          ],
          wildcard: false,
        },
        {
          exportPath: './cli',
          targets: [
            {
              target: './dist/cli.js',
            },
          ],
        },
      ],
      {
        rootDir: 'src',
        outDir: 'dist',
      },
      '/project' as any,
    )

    expect(result).toEqual(
      expect.arrayContaining([
        {
          exportPath: '.',
          sourceFile: 'src/index.ts',
        },
        {
          exportPath: './cli',
          sourceFile: 'src/cli.ts',
        },
      ]),
    )
  })
})
