import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { Effect } from 'effect'
import { NodeFileSystem } from '@effect/platform-node'
import { parseProjectExports } from '../PackageAnalyzer.js'

describe('parseProjectExports', () => {
  const tempDirs: Array<string> = []

  const createProject = async (packageJson: unknown, tsconfigJson: unknown) => {
    const dir = await mkdtemp(join(tmpdir(), 'agent-test-'))

    tempDirs.push(dir)

    await writeFile(join(dir, 'package.json'), JSON.stringify(packageJson, null, 2))

    await writeFile(join(dir, 'tsconfig.json'), JSON.stringify(tsconfigJson, null, 2))

    return dir
  }

  afterEach(async () => {
    await Promise.all(
      tempDirs.map((dir) =>
        rm(dir, {
          recursive: true,
          force: true,
        }),
      ),
    )

    tempDirs.length = 0
  })

  it('resolves string export', async () => {
    const projectDir = await createProject(
      {
        exports: {
          '.': './dist/index.js',
        },
      },
      {
        compilerOptions: {
          rootDir: './src',
          outDir: './dist',
        },
      },
    )

    const result = await Effect.runPromise(
      parseProjectExports(projectDir).pipe(Effect.provide(NodeFileSystem.layer)),
    )

    expect(result).toEqual([join(projectDir, 'src/index.ts')])
  })

  it('resolves import export', async () => {
    const projectDir = await createProject(
      {
        exports: {
          '.': {
            import: './dist/index.js',
            types: './dist/index.d.ts',
          },
        },
      },
      {
        compilerOptions: {
          rootDir: './src',
          outDir: './dist',
        },
      },
    )

    const result = await Effect.runPromise(
      parseProjectExports(projectDir).pipe(Effect.provide(NodeFileSystem.layer)),
    )

    expect(result).toEqual([join(projectDir, 'src/index.ts')])
  })

  it('fails when project does not exist', async () => {
    const exit = await Effect.runPromiseExit(
      parseProjectExports('/not/exist').pipe(Effect.provide(NodeFileSystem.layer)),
    )

    expect(exit._tag).toBe('Failure')
  })

  it('fails when package.json does not exist', async () => {
    const projectDir = await mkdtemp(join(tmpdir(), 'agent-test-'))

    tempDirs.push(projectDir)

    await writeFile(
      join(projectDir, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: {
          rootDir: './src',
          outDir: './dist',
        },
      }),
    )

    const exit = await Effect.runPromiseExit(
      parseProjectExports(projectDir).pipe(Effect.provide(NodeFileSystem.layer)),
    )

    expect(exit._tag).toBe('Failure')
  })

  it('fails when export entry has no import property', async () => {
    const projectDir = await createProject(
      {
        exports: {
          '.': {
            types: './dist/index.d.ts',
          },
        },
      },
      {
        compilerOptions: {
          rootDir: './src',
          outDir: './dist',
        },
      },
    )

    const exit = await Effect.runPromiseExit(
      parseProjectExports(projectDir).pipe(Effect.provide(NodeFileSystem.layer)),
    )

    expect(exit._tag).toBe('Failure')
  })
})
