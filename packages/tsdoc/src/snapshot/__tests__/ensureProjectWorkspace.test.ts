import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { Effect } from 'effect'

// mock dependencies
import * as fsMock from 'effect/FileSystem'
import { FullPath } from '@gyomu/schema'
import { WorkspaceRelativePath } from '@gyomu/schema/typescript'
import { ensureProjectWorkspace } from '../ensureProjectWorkspace.js'

const run = <A, E>(eff: Effect.Effect<A, E, never>) => Effect.runSync(eff)

// simple in-memory mock
const makeFsMock = () => {
  const createdDirs = new Set<string>()
  const writtenFiles: Record<string, string> = {}

  return {
    FileSystem: {
      makeDirectory: (path: string) =>
        Effect.sync(() => {
          createdDirs.add(path)
        }),

      exists: (path: string) => Effect.sync(() => path in writtenFiles),

      writeFileString: (path: string, content: string) =>
        Effect.sync(() => {
          writtenFiles[path] = content
        }),
    },

    state: {
      createdDirs,
      writtenFiles,
    },
  }
}

describe('ensureProjectWorkspace', () => {
  const repoRoot = FullPath('/repo')
  const projectPath = WorkspaceRelativePath('packages/app')

  it('creates workspace and manifest', () => {
    const mock = makeFsMock()

    const result = run(
      ensureProjectWorkspace(repoRoot, projectPath).pipe(
        Effect.provideService(fsMock.FileSystem, mock.FileSystem as any),
      ),
    )

    // projectId exists
    expect(result.projectId).toBeDefined()

    // paths are consistent
    expect(result.projectRoot).toContain('.gyomu')
    expect(result.manifestPath).toContain('manifest.json')
    expect(result.snapshotPath).toContain('file-hashes.json')
  })

  it('creates expected directory structure', () => {
    const mock = makeFsMock()

    run(
      ensureProjectWorkspace(repoRoot, projectPath).pipe(
        Effect.provideService(fsMock.FileSystem, mock.FileSystem as any),
      ),
    )

    expect(mock.state.createdDirs.size).toBeGreaterThan(0)

    const dirs = Array.from(mock.state.createdDirs)

    expect(dirs.some((d) => d.includes('.gyomu'))).toBe(true)
    expect(dirs.some((d) => d.includes('cache/tsdoc'))).toBe(true)
  })

  it('writes manifest file on first run', () => {
    const mock = makeFsMock()

    run(
      ensureProjectWorkspace(repoRoot, projectPath).pipe(
        Effect.provideService(fsMock.FileSystem, mock.FileSystem as any),
      ),
    )

    const manifestPath = Object.keys(mock.state.writtenFiles)[0]

    expect(manifestPath).toContain('manifest.json')

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const manifest = JSON.parse(mock.state.writtenFiles[manifestPath as string] as string)

    expect(manifest).toMatchObject({
      source: path.join('packages', 'app'),
      version: 1,
    })

    expect(manifest.id).toBeDefined()
    expect(manifest.createdAt).toBeDefined()
  })

  it('produces stable projectId for same input', () => {
    const mock1 = makeFsMock()
    const mock2 = makeFsMock()

    const r1 = run(
      ensureProjectWorkspace(repoRoot, projectPath).pipe(
        Effect.provideService(fsMock.FileSystem, mock1.FileSystem as any),
      ),
    )

    const r2 = run(
      ensureProjectWorkspace(repoRoot, projectPath).pipe(
        Effect.provideService(fsMock.FileSystem, mock2.FileSystem as any),
      ),
    )

    expect(r1.projectId).toBe(r2.projectId)
  })

  it('fails for invalid project path (escape attempt)', () => {
    const mock = makeFsMock()

    expect(() =>
      run(
        ensureProjectWorkspace(repoRoot, WorkspaceRelativePath('../etc')).pipe(
          Effect.provideService(fsMock.FileSystem, mock.FileSystem as any),
        ),
      ),
    ).toThrow()
  })
})
