import { Effect, Layer, FileSystem, PlatformError } from 'effect';
import path from 'path';
import { expect } from 'vitest';
import { MainLayer, PlatformLayer } from '../layer.js';
import { makeRunner } from '../runtime.js';
import {
  pathExists,
  readDirectoryDetailed,
  readFromFile,
  readStringFromFile,
} from '../fs/fs-utils.js';
import { IOError } from '../../errors.js';
import { tmpdir } from 'os';

export const tmpDir = () => {
  return tmpdir() + path.sep;
};

const nodeTestLayer = Layer.mergeAll(PlatformLayer, MainLayer);
const runNodeWithEnvOrThrow = makeRunner(nodeTestLayer);
const equals = (a: Uint8Array, b: Uint8Array): boolean => {
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }

  return true;
};
export const compareFiles = async (srcFile: string, destFile: string) => {
  return await runNodeWithEnvOrThrow(compareFilesEffect(srcFile, destFile));
};

const compareFilesEffect = (srcFile: string, destFile: string) => {
  return Effect.gen(function* () {
    const source = yield* readFromFile(srcFile);
    const destination = yield* readFromFile(destFile);
    const result = equals(source, destination);
    if (!result) {
      console.log(srcFile, destFile);
    }
    return result;
  });
};

export const validateTextFiles = async (srcFile: string, destFile: string) => {
  return await runNodeWithEnvOrThrow(
    Effect.gen(function* () {
      const srcData = (yield* readStringFromFile(srcFile)).replace(
        /\r\n|\r/g,
        '\n',
      );
      const destData = (yield* readStringFromFile(destFile)).replace(
        /\r\n|\r/g,
        '\n',
      );

      expect(srcData).toBe(destData);
    }),
  );
};

export const validateFolders = async (
  srcFolder: string,
  destFolder: string,
) => {
  return await runNodeWithEnvOrThrow(
    Effect.gen(function* () {
      expect(
        yield* compareFoldersFromSourceEffect(srcFolder, destFolder),
      ).toBeTruthy();
      expect(
        yield* compareFoldersFromDestEffect(srcFolder, destFolder),
      ).toBeTruthy();
    }),
  );
};
const compareFoldersFromSourceEffect = (
  srcFolder: string,
  destFolder: string,
): Effect.Effect<
  boolean,
  PlatformError.PlatformError | IOError,
  FileSystem.FileSystem
> => {
  return Effect.gen(function* () {
    const dirs = yield* readDirectoryDetailed(srcFolder);
    yield* Effect.forEach(
      dirs,
      (dirent) =>
        Effect.gen(function* () {
          const sourceFullPath = path.join(
            path.resolve(srcFolder),
            dirent.name,
          );

          const targetDestFullPath = path.join(
            path.resolve(destFolder),
            dirent.name,
          );

          if (dirent.type === 'File') {
            expect(yield* pathExists(targetDestFullPath)).toBeTruthy();

            expect(
              yield* compareFilesEffect(sourceFullPath, targetDestFullPath),
            ).toBeTruthy();
          } else {
            expect(yield* pathExists(targetDestFullPath)).toBeTruthy();

            // 🔥 再帰もちゃんと yield*
            yield* compareFoldersFromSourceEffect(
              sourceFullPath,
              targetDestFullPath,
            );
          }
        }),
      { concurrency: 1 }, // ← テストなので順序保証
    );

    return true;
  });
};
const compareFoldersFromDestEffect = (
  srcFolder: string,
  destFolder: string,
): Effect.Effect<
  boolean,
  PlatformError.PlatformError | IOError,
  FileSystem.FileSystem
> =>
  Effect.gen(function* () {
    const dirs = yield* readDirectoryDetailed(destFolder);

    yield* Effect.forEach(
      dirs,
      (dirent) =>
        Effect.gen(function* () {
          const destinationFullPath = path.join(
            path.resolve(destFolder),
            dirent.name,
          );

          const targetSourceFullPath = path.join(
            path.resolve(srcFolder),
            dirent.name,
          );

          expect(yield* pathExists(targetSourceFullPath)).toBeTruthy();

          if (dirent.type !== 'File') {
            // 🔥 再帰は必ず yield*
            yield* compareFoldersFromDestEffect(
              targetSourceFullPath,
              destinationFullPath,
            );
          }
        }),
      { concurrency: 1 }, // テストなので順序保証
    );

    return true;
  });
