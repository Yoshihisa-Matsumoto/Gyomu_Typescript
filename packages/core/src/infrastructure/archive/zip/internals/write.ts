import { Effect, Stream, FileSystem } from 'effect';
import { IOError } from '../../../../errors.js';
//import { Readable } from 'node:stream';

import { ZipFile } from 'yazl';
import { platform } from '../../../fs/index.js';
import { FileTransportInfo } from '../../../../gyomu/file/transport.js';
//import { fromReadable } from '../../../nodeStream.js';
import { NodeStream } from '@effect/platform-node';
import { pathExists, readDirectoryDetailed } from '../../../fs/fs-utils.js';

const addFile = (zip: ZipFile, fsPath: string, zipPath: string) =>
  Effect.sync(() => {
    zip.addFile(fsPath, zipPath);
  });

const addDirectory = (
  zip: ZipFile,
  fsPath: string,
  relativeTo: string,
): Effect.Effect<void, IOError, FileSystem.FileSystem> =>
  readDirectoryDetailed(fsPath).pipe(
    Effect.flatMap((items) =>
      Effect.forEach(items, (item) => {
        const itemPath = platform.join(fsPath, item.name);
        const zipPath = (relativeTo ? relativeTo + '/' : '') + item.name;

        if (item.isDirectory) {
          return addDirectory(zip, itemPath, zipPath);
        }

        if (item.isFile) {
          return addFile(zip, itemPath, zipPath);
        }

        return Effect.void;
      }),
    ),
  );

const processTransfers = (zip: ZipFile, list: FileTransportInfo[]) =>
  Effect.forEach(list, (info) => {
    const sourcePath = info.sourceFullNameWithBasePath;

    return pathExists(sourcePath).pipe(
      Effect.flatMap((exists) =>
        exists
          ? Effect.void
          : Effect.fail(new IOError(`File Not Found: ${sourcePath}`)),
      ),
      Effect.flatMap(() => {
        if (!info.isSourceDirectory) {
          const zipPath = info.destinationFullName.replace(/\\/g, '/');
          return addFile(zip, sourcePath, zipPath);
        }

        const destRoot = info.destinationPath
          ? info.destinationPath.replace(/\\/g, '/')
          : '';

        return addDirectory(zip, sourcePath, destRoot);
      }),
    );
  });

export const zipToStream = (
  transferInformationList: FileTransportInfo[],
): Stream.Stream<Uint8Array, IOError, FileSystem.FileSystem> =>
  Stream.unwrap(
    Effect.gen(function* () {
      const zip = new ZipFile();

      yield* processTransfers(zip, transferInformationList);

      // 👇 ここ重要（Stream開始前にend）
      zip.end();

      return NodeStream.fromReadable({ evaluate: () => zip.outputStream });
    }),
  );
