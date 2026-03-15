import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { Effect, Stream } from 'effect';
import { untar } from '../tar.js';
import { FileSystem } from '@effect/platform/FileSystem';
import { NodeFileSystem } from '@effect/platform-node';
import { IOError, unknownError } from '../../../errors.js';
import { Option } from 'effect';

describe('untar test', () => {
  it('untar should return entries and content from temp.tar', async () => {
    const tarPath = join(process.cwd(), 'tests', 'compress', 'temp.tar');
    const tarBytes = readFileSync(tarPath);
    const tarStream = Stream.fromIterable([new Uint8Array(tarBytes)]);

    const entryNames: string[] = [];
    let readmeText = '';

    await Effect.runPromise(
      Stream.runForEach(untar(tarStream), (entry) =>
        Stream.runCollect(entry.content).pipe(
          Effect.map((chunks) => {
            entryNames.push(entry.header.name);
            if (entry.header.name === 'README.md') {
              const buffer = Buffer.concat(
                Array.from(chunks).map((c) => Buffer.from(c)),
              );
              readmeText = buffer.toString('utf8');
            }
          }),
        ),
      ),
    );

    expect(entryNames).toContain('README.md');
    expect(entryNames).toContain('folder1/email_sender.py');
    expect(entryNames).toContain('setup.cfg');
    expect(readmeText.length).toBeGreaterThan(0);
    expect(readmeText).toContain('Gyomu');
  }, 15000);
  it('untar streaming test', async () => {
    const tarPath = join(process.cwd(), 'tests', 'compress', 'temp.tar');

    const program = (path: string, entryName: string) =>
      Effect.gen(function* () {
        const fileService = yield* FileSystem;

        // 1. Stream.unwrap で Effect<Stream> を Stream に展開
        return yield* fileService.stream(path).pipe(
          Stream.mapError((err) => unknownError(IOError, err)),
          // 2. 自作の untar を適用（untar は Stream<Source> -> Stream<TarEntry> である想定）
          untar,
          Stream.filter((entry) => entry.header.name === entryName),
          // 3. runForEach で各エントリを処理（ここは Effect を返す）
          Stream.mapEffect((entry) =>
            Effect.gen(function* () {
              const chunks = yield* Stream.runCollect(entry.content);
              return Buffer.concat(Array.from(chunks)).toString('utf8');
            }),
          ),
          Stream.runHead,
          Effect.map((option) => Option.getOrNull(option)),
        );
      });
    const readMe = await Effect.runPromise(
      program(tarPath, 'README.md').pipe(
        Effect.provide(NodeFileSystem.layer),
        Effect.scoped,
      ),
    );
    // expect(allNames).toContain('README.md');
    // expect(allNames).toContain('folder1/email_sender.py');
    // expect(allNames).toContain('setup.cfg');
    expect(readMe).not.toBeNull();
    expect(readMe!).toContain('Gyomu');
  }, 15000);
});
