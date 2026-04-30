import { Effect, FileSystem } from 'effect';
import { Stream } from 'effect';
import { NetworkError, IOError } from '../../errors.js';
import path from 'path';
import { networkStream } from '../../shared/effect/stream.js';
import { fetchEffect } from './client.js';
import {
  ensureFileNotExist,
  getFileStat,
  pathExists,
  writeStreamToFile,
} from '../fs/fs-utils.js';

export const webDownloadStream = (
  url: string,
  headers?: Record<string, string>,
): Stream.Stream<Uint8Array, NetworkError> =>
  Stream.unwrap(
    Effect.gen(function* () {
      const response = yield* fetchEffect(url, { headers });

      if (!response.body) {
        return yield* Effect.fail(
          new NetworkError({
            message: 'No response body',
            endpoint: url,
            retryable: false,
            cause: undefined,
            operation: 'download',
          }),
        );
      }

      return networkStream(() => response.body!, `Stream error `);
    }),
  );
export const webDownload = (
  url: string,
  destinationFilename: string,
  headers?: Record<string, string>,
): Effect.Effect<boolean, NetworkError | IOError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    // =====================
    // validation
    // =====================
    if (
      (yield* pathExists(destinationFilename)) &&
      destinationFilename !== path.basename(destinationFilename)
    ) {
      return yield* Effect.fail(
        new IOError({
          message: `Invalid Filepath`,
          target: destinationFilename,
          layer: 'filesystem',
          operation: 'write',
          cause: undefined,
        }),
      );
    }

    if (
      (yield* pathExists(destinationFilename)) &&
      (yield* getFileStat(destinationFilename)).type == 'Directory'
    ) {
      return yield* Effect.fail(
        new IOError({
          message: 'target must be file, but it is directory',
          target: destinationFilename,
          cause: undefined,
          layer: 'filesystem',
          operation: 'write',
        }),
      );
    }

    if (!path.extname(destinationFilename)) {
      return yield* Effect.fail(
        new IOError({
          message: 'filename should include extension',
          target: destinationFilename,
          cause: undefined,
          layer: 'filesystem',
          operation: 'write',
        }),
      );
    }

    // =====================
    // file prepare
    // =====================
    yield* ensureFileNotExist(destinationFilename);

    // const writer = yield* fromSync(
    //   IOError,
    //   `fail to create write stream`,
    // )(() => fs.createWriteStream(destinationFilename));

    // =====================
    // download stream
    // =====================
    const stream = webDownloadStream(url, headers);

    // // =====================
    // // write file
    // // =====================
    // yield* fromPromise(
    //   IOError,
    //   `Web Download Error:${url} into ${destinationFilename}`,
    // )(async () => {
    //   const fileWriterStream = path.createWriteStream(destinationFilename);

    //   await finished(Readable.fromWeb(stream as any).pipe(fileWriterStream));
    // });
    // yield* stream.pipe(
    //   Stream.runForEach((chunk) =>
    //     fromSync(
    //       IOError,
    //       `write failed: ${destinationFilename}`,
    //     )(() => writer.write(chunk)),
    //   ),
    // );
    yield* writeStreamToFile(destinationFilename)(stream);
    return true;
  });
