import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Effect } from 'effect'
import { makeRunner } from '@gyomu/schema/effect'
import { PlatformLayer } from '@gyomu/infra'
import { buildSections } from '../buildSections.js'

const runQAWithEnvOrThrow = makeRunner(PlatformLayer)

describe('buildSections', () => {
  const context = {} as any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('builds enabled sections only', async () => {
    const builders = [
      {
        id: 'overview',
        enabled: () => true,
        build: () =>
          Effect.succeed({
            id: 'overview',
            title: undefined,
            contents: [],
          }),
      },
      {
        id: 'installation',
        enabled: () => false,
        build: () =>
          Effect.succeed({
            id: 'installation',
            title: undefined,
            contents: [],
          }),
      },
    ] as const

    const result = await runQAWithEnvOrThrow(buildSections(context, builders as any))

    expect(result).toEqual([
      {
        id: 'overview',
        title: undefined,
        contents: [],
      },
    ])
  })

  it('keeps builder order', async () => {
    const builders = [
      {
        id: 'first',
        enabled: () => true,
        build: () =>
          Effect.succeed({
            id: 'first',
            title: undefined,
            contents: [],
          }),
      },
      {
        id: 'second',
        enabled: () => true,
        build: () =>
          Effect.succeed({
            id: 'second',
            title: undefined,
            contents: [],
          }),
      },
    ]

    const result = await runQAWithEnvOrThrow(buildSections(context, builders as any))

    expect(result.map((s) => s.id)).toEqual(['first', 'second'])
  })

  it('fails when builder fails', async () => {
    const builders = [
      {
        id: 'overview',
        enabled: () => true,
        build: () => Effect.fail(new Error('build failed')),
      },
    ] as const

    await expect(runQAWithEnvOrThrow(buildSections(context, builders as any))).rejects.toThrow()
  })
})
