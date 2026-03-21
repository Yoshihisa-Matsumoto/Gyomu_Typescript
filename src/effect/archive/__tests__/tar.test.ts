import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { Effect, Result, Stream } from 'effect';
import {
  extractTar,
  filterEntries,
  readTextEntry,
  requireEntry,
  untar,
} from '../tar.js';
import { IOError } from '../../../errors.js';
import { Option } from 'effect';
import { platform } from '../../../platform/index.js';
import { validateFolders } from '../../../__tests__/baseClass.js';
import { runWithEnv, runWithEnvOrThrow } from '../../infrastructure/runtime.js';
import { FileTransportInfo } from '../../../fileModel.js';
import { fileStream } from '../../fs-utils.js';

let compressDirectory: string;
let extractDirectory: string;
beforeAll(() => {
  const tmpPath = platform.tmpdir();
  const sourceDirectory = platform.resolve('./tests');
  const destinationDirectory = platform.join(tmpPath, 'compressTar');

  platform.emptyDirSync(destinationDirectory);
  platform.copySync(sourceDirectory, destinationDirectory);
  compressDirectory = destinationDirectory;
  extractDirectory = platform.join(destinationDirectory, 'extract');
  platform.emptyDirSync(extractDirectory);
});

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
  it('untar streaming test with filtering entries', async () => {
    const tarPath = join(process.cwd(), 'tests', 'compress', 'temp.tar');
    // const rawRecords = await runWithEnv(
    //   Stream.runCollect(fileStream(inputFile).pipe(parseCsv())),
    // );
    const readMe = await runWithEnvOrThrow(
      fileStream(tarPath).pipe(
        untar,
        filterEntries((header) => header.name == 'README.md'),
        Stream.runHead,
        Effect.flatMap(
          Option.match({
            onNone: () => Effect.fail(new IOError(`File not found: README.md`)),
            onSome: (entry) => Effect.succeed(entry),
          }),
        ), // ここで見つからなければ IOError
        Effect.flatMap(readTextEntry),
      ),
    );
    expect(readMe).not.toBeNull();
    expect(readMe).toContain('Gyomu');
    console.log(readMe);
  });
  it('untar streaming test with mandatory require Entry', async () => {
    const tarPath = join(process.cwd(), 'tests', 'compress', 'temp.tar');

    const readMe = await runWithEnvOrThrow(
      fileStream(tarPath).pipe(
        untar,
        requireEntry('README.md'), // ここで見つからなければ IOError
        Effect.flatMap(readTextEntry),
      ),
    );
    expect(readMe).not.toBeNull();
    expect(readMe).toContain('Gyomu');
    //console.log(readMe);
  });
  it('Tar2 Unarchive Folder Test', async () => {
    const transferInformation = new FileTransportInfo({
      sourceFolderName: 'folder1/folder 2',
      destinationFolderName: platform.join(extractDirectory, 'folder 2'),
    });
    const tarFilename = platform.join(compressDirectory, 'compress/temp.tar');
    const program = (path: string, transferInformation: FileTransportInfo) =>
      fileStream(path).pipe(extractTar(transferInformation));
    const result = await runWithEnv(program(tarFilename, transferInformation));
    // const archive: TarArchive = new TarArchive(
    //   platform.join(compressDirectory, 'compress/temp.tar'),
    // );
    // let result = await archive.extract(transferInformation);
    //expect(result.isOk()).toBeTruthy();
    expect(Result.isSuccess(result)).toBeTruthy();
    validateFolders(
      platform.join(compressDirectory, 'source/folder1/folder 2'),
      platform.join(extractDirectory, 'folder 2'),
    );
  });
});
