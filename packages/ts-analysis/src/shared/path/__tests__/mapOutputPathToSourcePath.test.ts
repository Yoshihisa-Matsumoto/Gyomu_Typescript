import { describe, expect, it } from 'vitest'
import { FullPath } from '@gyomu/schema'
import { mapOutputPathToSourcePath } from '../mapOutputPathToSourcePath.js'

describe('mapOutputPathToSourcePath', () => {
  const packageRootPath = FullPath('/workspace/project')

  it('resolves root entry file', () => {
    const result = mapOutputPathToSourcePath('./dist/index.js', {
      packageRootPath,
      rootDir: './src',
      outDir: './dist',
    })

    expect(result).toBe('src/index.ts')
  })

  it('resolves nested entry file', () => {
    const result = mapOutputPathToSourcePath('./dist/react/index.js', {
      packageRootPath,
      rootDir: './src',
      outDir: './dist',
    })

    expect(result).toBe('src/react/index.ts')
  })

  it('supports rootDir and outDir without leading "./"', () => {
    const result = mapOutputPathToSourcePath('./dist/server/api.js', {
      packageRootPath,
      rootDir: 'src',
      outDir: 'dist',
    })

    expect(result).toBe('src/server/api.ts')
  })

  it('throws when export file is outside outDir', () => {
    expect(() =>
      mapOutputPathToSourcePath('./build/index.js', {
        packageRootPath,
        rootDir: './src',
        outDir: './dist',
      }),
    ).toThrow('./build/index.js is not inside outDir (./dist)')
  })

  it('preserves non-js extensions', () => {
    const result = mapOutputPathToSourcePath('./dist/index.mjsa', {
      packageRootPath,
      rootDir: './src',
      outDir: './dist',
    })

    expect(result).toBe('src/index.mjsa')
  })
  it('converts mjs to ts', () => {
    const result = mapOutputPathToSourcePath('./dist/index.mjs', {
      packageRootPath,
      rootDir: './src',
      outDir: './dist',
    })

    expect(result).toBe('src/index.ts')
  })
})
