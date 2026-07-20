import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { Effect } from 'effect'
import { beforeEach, describe, expect, it } from 'vitest'

import { PlatformLayer } from '@gyomu/infra'
import { FullPath } from '@gyomu/schema'
import { ___resetWorkspaceRoot } from '../../path/findWorkspaceRoot.js'
import { listTypescriptProject } from '../listTypescriptProject.js'

describe('listTypescriptProject', () => {
  beforeEach(() => {
    ___resetWorkspaceRoot()
  })

  it('lists workspace projects', async () => {
    const root = await mkdtemp(join(tmpdir(), 'gyomu-'))

    await writeFile(
      join(root, 'pnpm-workspace.yaml'),
      `
packages:
  - packages/*
`,
    )

    const core = join(root, 'packages', 'core')
    const cli = join(root, 'packages', 'cli')

    await mkdir(core, { recursive: true })
    await mkdir(cli, { recursive: true })

    await writeFile(
      join(core, 'package.json'),
      JSON.stringify({
        name: '@gyomu/core',
      }),
    )

    await writeFile(
      join(cli, 'package.json'),
      JSON.stringify({
        name: '@gyomu/cli',
      }),
    )

    await writeFile(join(core, 'tsconfig.json'), '{}')

    const result = await Effect.runPromise(
      listTypescriptProject(FullPath(root)).pipe(Effect.provide(PlatformLayer)),
    )

    expect(
      result.projects.map((p) => ({
        name: p.name,
        rootPath: p.rootPath,
        hasTypescript: p.hasTypescript,
      })),
    ).toEqual(
      expect.arrayContaining([
        {
          name: '@gyomu/core',
          rootPath: join('packages', 'core'),
          hasTypescript: true,
        },
        {
          name: '@gyomu/cli',
          rootPath: join('packages', 'cli'),
          hasTypescript: false,
        },
      ]),
    )
  })

  it('ignores packages without name', async () => {
    const root = await mkdtemp(join(tmpdir(), 'gyomu-'))

    await writeFile(
      join(root, 'pnpm-workspace.yaml'),
      `
packages:
  - packages/*
`,
    )

    const pkg = join(root, 'packages', 'invalid')

    await mkdir(pkg, { recursive: true })

    await writeFile(join(pkg, 'package.json'), '{}')

    const result = await Effect.runPromise(
      listTypescriptProject(FullPath(root)).pipe(Effect.provide(PlatformLayer)),
    )

    expect(result.projects).toEqual([])
  })

  it('ignores directories without package.json', async () => {
    const root = await mkdtemp(join(tmpdir(), 'gyomu-'))

    await writeFile(
      join(root, 'pnpm-workspace.yaml'),
      `
packages:
  - packages/*
`,
    )

    await mkdir(join(root, 'packages', 'empty'), { recursive: true })

    const result = await Effect.runPromise(
      listTypescriptProject(FullPath(root)).pipe(Effect.provide(PlatformLayer)),
    )

    expect(result.projects).toEqual([])
  })
  it('lists catalogs', async () => {
    const root = await mkdtemp(join(tmpdir(), 'gyomu-'))

    await writeFile(
      join(root, 'pnpm-workspace.yaml'),
      `
packages:
  - packages/*

catalog:
  effect: 4.0.0-beta.92
  '@effect/platform-node': 4.0.0-beta.92
`,
    )

    const core = join(root, 'packages', 'core')
    const cli = join(root, 'packages', 'cli')

    await mkdir(core, { recursive: true })
    await mkdir(cli, { recursive: true })

    await writeFile(
      join(core, 'package.json'),
      JSON.stringify({
        name: '@gyomu/core',
      }),
    )

    await writeFile(
      join(cli, 'package.json'),
      JSON.stringify({
        name: '@gyomu/cli',
      }),
    )

    await writeFile(join(core, 'tsconfig.json'), '{}')

    const result = await Effect.runPromise(
      listTypescriptProject(FullPath(root)).pipe(Effect.provide(PlatformLayer)),
    )
    expect(result.catalog).toMatchObject({
      effect: '4.0.0-beta.92',
      '@effect/platform-node': '4.0.0-beta.92',
    })
  })
})
