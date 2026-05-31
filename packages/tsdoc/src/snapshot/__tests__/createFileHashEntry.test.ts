import { describe, expect, it } from 'vitest'
import { Effect } from 'effect'
import { PlatformLayer } from '@gyomu/infra'

import { createFileHashEntry } from '../createFileHashEntry.js'

import type { FileInfo } from '@gyomu/schema/gyomu/file'

const createFileInfo = (fullPath: string, updatedAt: Date): FileInfo =>
  ({
    fullPath,
    updateTime: updatedAt,
  }) as any

describe('createFileHashEntry', () => {
  it('creates file hash entry', async () => {
    const updatedAt = new Date('2026-01-01T00:00:00.000Z')

    const fileInfo = createFileInfo('./test-fixtures/snapshot/sample.ts', updatedAt)

    const result = await Effect.runPromise(
      createFileHashEntry(fileInfo).pipe(Effect.provide(PlatformLayer)),
    )

    expect(result.path).toBe('./test-fixtures/snapshot/sample.ts')

    expect(result.updatedAt).toBe(updatedAt.toISOString())

    expect(result.rawHash.length).toBeGreaterThan(0)
  })

  it('returns same hash for same content', async () => {
    const updatedAt = new Date()

    const fileInfo = createFileInfo('./test-fixtures/snapshot/sample.ts', updatedAt)

    const result1 = await Effect.runPromise(
      createFileHashEntry(fileInfo).pipe(Effect.provide(PlatformLayer)),
    )

    const result2 = await Effect.runPromise(
      createFileHashEntry(fileInfo).pipe(Effect.provide(PlatformLayer)),
    )

    expect(result1.rawHash).toBe(result2.rawHash)
  })

  it('returns different hash when content changes', async () => {
    const updatedAt = new Date()

    const fileInfo1 = createFileInfo('./test-fixtures/snapshot/sample-a.ts', updatedAt)

    const fileInfo2 = createFileInfo('./test-fixtures/snapshot/sample-b.ts', updatedAt)

    const result1 = await Effect.runPromise(
      createFileHashEntry(fileInfo1).pipe(Effect.provide(PlatformLayer)),
    )

    const result2 = await Effect.runPromise(
      createFileHashEntry(fileInfo2).pipe(Effect.provide(PlatformLayer)),
    )

    expect(result1.rawHash).not.toBe(result2.rawHash)
  })
})
