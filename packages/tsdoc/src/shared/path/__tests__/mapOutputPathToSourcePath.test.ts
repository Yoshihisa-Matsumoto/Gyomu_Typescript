import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { mapOutputPathToSourcePath } from '../mapOutputPathToSourcePath.js'

describe('mapOutputPathToSourcePath', () => {
  const cwd = '/workspace/project'

  it('resolves root entry file', () => {
    const result = mapOutputPathToSourcePath('./dist/index.js', {
      cwd,
      rootDir: './src',
      outDir: './dist',
    })

    expect(result).toBe(resolve(cwd, 'src/index.ts'))
  })

  it('resolves nested entry file', () => {
    const result = mapOutputPathToSourcePath('./dist/react/index.js', {
      cwd,
      rootDir: './src',
      outDir: './dist',
    })

    expect(result).toBe(resolve(cwd, 'src/react/index.ts'))
  })

  it('supports rootDir and outDir without leading "./"', () => {
    const result = mapOutputPathToSourcePath('./dist/server/api.js', {
      cwd,
      rootDir: 'src',
      outDir: 'dist',
    })

    expect(result).toBe(resolve(cwd, 'src/server/api.ts'))
  })

  it('throws when export file is outside outDir', () => {
    expect(() =>
      mapOutputPathToSourcePath('./build/index.js', {
        cwd,
        rootDir: './src',
        outDir: './dist',
      }),
    ).toThrow('./build/index.js is not inside outDir (./dist)')
  })

  it('preserves non-js extensions', () => {
    const result = mapOutputPathToSourcePath('./dist/index.mjsa', {
      cwd,
      rootDir: './src',
      outDir: './dist',
    })

    expect(result).toBe(resolve(cwd, 'src/index.mjsa'))
  })
  it('converts mjs to ts', () => {
    const result = mapOutputPathToSourcePath('./dist/index.mjs', {
      cwd,
      rootDir: './src',
      outDir: './dist',
    })

    expect(result).toBe(resolve(cwd, 'src/index.ts'))
  })
})
