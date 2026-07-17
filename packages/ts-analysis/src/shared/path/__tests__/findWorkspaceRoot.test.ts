import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { beforeEach, describe, expect, it } from 'vitest'
import { Effect } from 'effect'
import { PlatformLayer } from '@gyomu/infra'
import { FullPath } from '@gyomu/schema'
import { ___resetWorkspaceRoot, findWorkspaceRoot } from '../findWorkspaceRoot.js'

describe('findWorkspaceRoot', () => {
  beforeEach(() => {
    ___resetWorkspaceRoot()
  })
  it('finds pnpm-workspace.yaml', async () => {
    const root = await mkdtemp(join(tmpdir(), 'gyomu-'))

    await writeFile(join(root, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*')

    const nested = join(root, 'packages', 'app')

    await mkdir(nested, { recursive: true })

    const result = await Effect.runPromise(
      findWorkspaceRoot(FullPath(nested)).pipe(Effect.provide(PlatformLayer)),
    )

    expect(result).toBe(root)
  })
  it('finds .git when pnpm-workspace.yaml does not exist', async () => {
    const root = await mkdtemp(join(tmpdir(), 'gyomu-'))

    // 実際の Git リポジトリである必要はなく、
    // findWorkspaceRoot は存在確認しかしないので空ディレクトリで十分
    await mkdir(join(root, '.git'))

    const nested = join(root, 'packages', 'app')

    await mkdir(nested, { recursive: true })

    const result = await Effect.runPromise(
      findWorkspaceRoot(FullPath(nested)).pipe(Effect.provide(PlatformLayer)),
    )

    expect(result).toBe(root)
  })
  it('prefers pnpm-workspace.yaml over .git', async () => {
    const root = await mkdtemp(join(tmpdir(), 'gyomu-'))

    await writeFile(join(root, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*')

    await mkdir(join(root, '.git'))

    const nested = join(root, 'packages', 'app')

    await mkdir(nested, { recursive: true })

    const result = await Effect.runPromise(
      findWorkspaceRoot(FullPath(nested)).pipe(Effect.provide(PlatformLayer)),
    )

    expect(result).toBe(root)
  })
})
