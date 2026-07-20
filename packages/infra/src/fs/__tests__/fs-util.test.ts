import { createReadStream } from 'node:fs'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { Effect, FileSystem, Result, Schema, Stream } from 'effect'
import { describe, expect, it } from 'vitest'
import { NodeFileSystem, NodeStream } from '@effect/platform-node'
import { IOError, wrapInfraError } from '@gyomu/schema'
import { makeRunner, makeRunnerAsReturn } from '@gyomu/schema/effect'
import { readJsonFromFileAndValidate, readStringFromFile } from '../fs-utils.js'

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
  it('readStringFromFile not existence check', async () => {
    const program = () =>
      Effect.gen(function* () {
        return yield* readStringFromFile('unknownaabc/dakfa.tst')
      })

    // 実行例
    const result = await makeRunnerAsReturn(NodeFileSystem.layer)(program())
    expect(Result.isFailure(result)).toBeTruthy()
    if (Result.isFailure(result)) {
      expect(result.failure.reason).toBe('NotFound')
    }
  })
})

const TestSchema = Schema.Struct({
  name: Schema.String,
  age: Schema.Number,
})

describe('readJsonFromFileAndValidate', () => {
  const createTempFile = async (contents: string) => {
    const dir = await mkdtemp(join(tmpdir(), 'json-test-'))
    const file = join(dir, 'test.json')
    await writeFile(file, contents, 'utf8')
    return file
  }
  const runner = makeRunner(NodeFileSystem.layer)
  it('returns validated object', async () => {
    const file = await createTempFile(
      JSON.stringify({
        name: 'Alice',
        age: 20,
      }),
    )

    const result = await runner(readJsonFromFileAndValidate('TestSchema', TestSchema, file))

    expect(result).toEqual({
      name: 'Alice',
      age: 20,
    })
  })

  it('fails when schema validation fails', async () => {
    const file = await createTempFile(
      JSON.stringify({
        name: 'Alice',
        age: '20',
      }),
    )

    await expect(
      runner(readJsonFromFileAndValidate('TestSchema', TestSchema, file)),
    ).rejects.toThrow()
  })

  it('fails when json is invalid', async () => {
    const file = await createTempFile('{ invalid json }')

    await expect(
      runner(readJsonFromFileAndValidate('TestSchema', TestSchema, file)),
    ).rejects.toThrow()
  })

  it('fails when file does not exist', async () => {
    await expect(
      runner(readJsonFromFileAndValidate('TestSchema', TestSchema, '/not/exist/file.json')),
    ).rejects.toThrow()
  })
})
