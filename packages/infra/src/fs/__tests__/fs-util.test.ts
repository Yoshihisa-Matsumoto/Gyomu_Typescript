import { createReadStream } from 'node:fs'
import { Effect, FileSystem, Stream } from 'effect'
import { describe, it } from 'vitest'
import { NodeFileSystem, NodeStream } from '@effect/platform-node'
import { IOError, wrapInfraError } from '@gyomu/schema'

describe('FileSystem simple test', () => {
  it('FileSystem test', async () => {
    const program = (path: string) =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem

        return fs.stream(path).pipe(
          Stream.tap(() => Effect.log('[chunk]')),
          Stream.runDrain,
        )
      })

    // 実行例
    await Effect.runPromise(
      program('tests/test.utf8.csv').pipe(
        Effect.flatten,
        Effect.provide(NodeFileSystem.layer),
        Effect.scoped,
      ),
    )
  })
  it('NodeStream.fromReadable test', async () => {
    const program = (path: string) =>
      Effect.gen(function* () {
        return yield* NodeStream.fromReadable<Uint8Array, IOError>({
          evaluate: () => createReadStream(path),
          onError: (e) =>
            wrapInfraError(IOError, e, () => ({
              layer: 'stream' as const,
              operation: 'read' as const,
              message: 'fail to read file',
              target: path,
            })),
        }).pipe(
          Stream.tap(() => Effect.log('[chunk]')),
          Stream.runDrain,
        )
      })

    // 実行例
    await Effect.runPromise(
      program('tests/test.utf8.csv').pipe(Effect.provide(NodeFileSystem.layer), Effect.scoped),
    )
  })
})
