import { Effect, FileSystem } from 'effect';
import { Stream } from 'effect';
import { NetworkError, IOError } from '../../errors.js';
import { platform } from '../fs/index.js';
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
        return yield* Effect.fail(new NetworkError('No response body'));
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
      destinationFilename !== platform.basename(destinationFilename)
    ) {
      return yield* Effect.fail(
        new IOError(`Invalid Filepath :${destinationFilename}`),
      );
    }

    if (
      (yield* pathExists(destinationFilename)) &&
      (yield* getFileStat(destinationFilename)).type == 'Directory'
    ) {
      return yield* Effect.fail(
        new IOError(`This is directory:${destinationFilename}`),
      );
    }

    if (!platform.extname(destinationFilename)) {
      return yield* Effect.fail(
        new IOError(
          `file name should include extension:${destinationFilename}`,
        ),
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
    //   const fileWriterStream = platform.createWriteStream(destinationFilename);

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
