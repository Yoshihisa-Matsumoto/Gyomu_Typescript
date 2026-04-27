import { Effect, Stream } from 'effect';
import { describe, it } from 'vitest';
import { FileSystem } from 'effect';
import { NodeFileSystem, NodeStream } from '@effect/platform-node';
import { IOError } from '../../errors.js';
import fs from 'fs';
import { unknownError } from '@gyomu/shared';

describe('FileSystem simple test', () => {
  it('FileSystem test', async () => {
    const program = (path: string) =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;

        return fs.stream(path).pipe(
          Stream.tap(() => Effect.log('[chunk]')),
          Stream.runDrain,
        );
      });

    // 実行例
    await Effect.runPromise(
      program('tests/test.utf8.csv').pipe(
        Effect.flatten,
        Effect.provide(NodeFileSystem.layer),
        Effect.scoped,
      ),
    );
  });
  it('NodeStream.fromReadable test', async () => {
    const program = (path: string) =>
      Effect.gen(function* () {
        return yield* NodeStream.fromReadable<Uint8Array, IOError>({
          evaluate: () => fs.createReadStream(path),
          onError: (e) => unknownError(IOError, e, 'file read error'),
        }).pipe(
          Stream.tap(() => Effect.log('[chunk]')),
          Stream.runDrain,
        );
      });

    // 実行例
    await Effect.runPromise(
      program('tests/test.utf8.csv').pipe(
        Effect.provide(NodeFileSystem.layer),
        Effect.scoped,
      ),
    );
  });
});
