import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { Effect, Result, Stream } from 'effect';

import { IOError } from '../../../errors.js';
import { Option } from 'effect';
import { platform } from '../../../platform/index.js';
import { compareFiles, validateFolders } from '../../../__tests__/baseClass.js';
import { runWithEnv, runWithEnvOrThrow } from '../../infrastructure/runtime.js';
import { FileTransportInfo } from '../../../fileModel.js';
import { fileStream } from '../../fs-utils.js';
import {
  existsInTar,
  filterEntries,
  requireEntry,
  TarService,
} from '../tar/index.js';

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

const validateFileExistence = async (
  tarFilename: string,
  entryName: string,
  expected_result: boolean,
) => {
  const program = (path: string, entryName: string) =>
    fileStream(path).pipe(existsInTar(entryName));
  const result = await runWithEnv(program(tarFilename, entryName));
  if (Result.isSuccess(result)) {
    if (result.success !== expected_result) {
      console.log(
        entryName,
        'Different from expected result:',
        expected_result,
      );
    }
    expect(result.success).toBe(expected_result);
  } else {
    console.log(result.failure);
    expect(false).toBeTruthy();
  }
};
describe('untar test', () => {
  it('untar should return entries and content from temp.tar', async () => {
    const tarPath = join(process.cwd(), 'tests', 'compress', 'temp.tar');
    const tarBytes = readFileSync(tarPath);
    const tarStream = Stream.fromIterable([new Uint8Array(tarBytes)]);

    const entryNames: string[] = [];
    let readmeText = '';

    await Effect.runPromise(
      Effect.gen(function* () {
        const tar = yield* TarService;

        yield* Stream.runForEach(tar.unarchive(tarStream), (entry) =>
          Stream.runCollect(entry.openStream()).pipe(
            Effect.map((chunks) => {
              entryNames.push(entry.path);
              if (entry.path === 'README.md') {
                const buffer = Buffer.concat(
                  Array.from(chunks).map((c) => Buffer.from(c)),
                );
                readmeText = buffer.toString('utf8');
              }
            }),
          ),
        );
      }).pipe(Effect.provide(TarService.live)),
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
    const program = Effect.gen(function* () {
      const tar = yield* TarService;
      return yield* fileStream(tarPath).pipe(
        tar.unarchive,
        filterEntries((header) => header.path == 'README.md'),
        Stream.runHead,
        Effect.flatMap(
          Option.match({
            onNone: () => Effect.fail(new IOError(`File not found: README.md`)),
            onSome: (entry) => Effect.succeed(entry),
          }),
        ), // ここで見つからなければ IOError
        Effect.flatMap(tar.readTextEntry),
      );
    });
    const readMe = await runWithEnvOrThrow(program, TarService.live);
    expect(readMe).not.toBeNull();
    expect(readMe).toContain('Gyomu');
    console.log(readMe);
  });
  it('untar streaming test with mandatory require Entry', async () => {
    const tarPath = join(process.cwd(), 'tests', 'compress', 'temp.tar');
    const program = Effect.gen(function* () {
      const tar = yield* TarService;
      return yield* fileStream(tarPath).pipe(
        tar.unarchive,
        requireEntry('README.md'), // ここで見つからなければ IOError
        Effect.flatMap(tar.readTextEntry),
      );
    });
    const readMe = await runWithEnvOrThrow(program, TarService.live);
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
      Effect.gen(function* () {
        const tar = yield* TarService;
        return yield* fileStream(path).pipe(tar.extract(transferInformation));
      });
    const result = await runWithEnv(
      program(tarFilename, transferInformation),
      TarService.live,
    );
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
  it('Tar Creation Test', async () => {
    //const extractDirectory = platform.join(compressDirectory,'extracted');
    const sourceDirectory = platform.join(compressDirectory, 'source');
    const tarFileName = platform.join(compressDirectory, 'test_tar_create.tar');

    const program = (path: string) =>
      Effect.gen(function* () {
        const tar = yield* TarService;
        return yield* tar.create({ tarFileName: path, cwd: sourceDirectory });
      });
    //const transferInformationList = [transferInformation];
    const result = await runWithEnvOrThrow(
      program(tarFileName),
      TarService.live,
    );

    expect(result).toBeTruthy();

    console.log('Create Tar Done');
    await validateFileExistence(tarFileName, 'README.md', true);
    console.log('Tar Entry check done');
    await validateFileExistence(tarFileName, 'README1.md', false);

    await validateFileExistence(
      tarFileName,
      'folder1/folder 2/aes_encryption.py',
      true,
    );

    await validateFileExistence(
      tarFileName,
      'folder1\\folder 2\\aes_encryption.py',
      true,
    );

    await validateFileExistence(
      tarFileName,
      'folder1\\folder 3\\aes_encryption.py',
      false,
    );
    await validateFileExistence(tarFileName, 'ユーザー噂.py', true);

    const destinationRoot = platform.join(extractDirectory, 'fullTarCreate');
    const program2 = (path: string, destination: string) =>
      Effect.gen(function* () {
        const tar = yield* TarService;
        return yield* fileStream(path).pipe(
          tar.extractDirectory({ targetDir: destination }),
        );
      });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const result2 = await runWithEnvOrThrow(
      program2(tarFileName, destinationRoot),
      TarService.live,
    );
    //result = await archive.extractAll(destinationRoot);

    validateFolders(
      platform.join(compressDirectory, 'source'),
      destinationRoot,
    );
  }, 10000);
  it('Tar Unarchive Test', async () => {
    let transferInformation: FileTransportInfo;
    let extractedFile: string;
    transferInformation = new FileTransportInfo({
      sourceFilename: 'README.md',
      destinationFolderName: extractDirectory,
    });
    const tarFileName = platform.join(compressDirectory, 'compress/temp.tar');

    const program = (path: string, transferInformation: FileTransportInfo) =>
      Effect.gen(function* () {
        const tar = yield* TarService;
        return yield* fileStream(path).pipe(tar.extract(transferInformation));
      });
    let result = await runWithEnvOrThrow(
      program(tarFileName, transferInformation),
      TarService.live,
    );
    extractedFile = platform.join(extractDirectory, 'README.md');
    expect(
      compareFiles(
        extractedFile,
        platform.join(compressDirectory, 'source/README.md'),
      ),
    ).toBeTruthy();

    transferInformation = new FileTransportInfo({
      sourceFilename: 'email_sender.py',
      sourceFolderName: 'folder1',
      destinationFolderName: extractDirectory,
    });
    result = await runWithEnvOrThrow(
      program(tarFileName, transferInformation),
      TarService.live,
    );
    extractedFile = platform.join(extractDirectory, 'email_sender.py');
    expect(
      compareFiles(
        extractedFile,
        platform.join(compressDirectory, 'source/folder1/email_sender.py'),
      ),
    ).toBeTruthy();

    await validateFileExistence(tarFileName, 'ユーザー噂.py', true);

    transferInformation = new FileTransportInfo({
      sourceFilename: 'ユーザー噂.py',
      destinationFolderName: extractDirectory,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    result = await runWithEnvOrThrow(
      program(tarFileName, transferInformation),
      TarService.live,
    );
    extractedFile = platform.join(extractDirectory, 'ユーザー噂.py');
    expect(
      compareFiles(
        extractedFile,
        platform.join(compressDirectory, 'source/ユーザー噂.py'),
      ),
    ).toBeTruthy();
  }, 10000);
});
