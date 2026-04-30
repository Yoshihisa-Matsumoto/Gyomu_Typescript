// import { readFileSync } from 'node:fs';
// import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { Effect, Layer, Result, Stream } from 'effect';

import { IOError } from '@gyomu/core';
import { Option } from 'effect';
//import { fs } from '../fs/index.js';
import { compareFiles, validateFolders } from './baseClass.js';
import { FileTransportInfo } from '@gyomu/core/gyomu/file';
import {
  copyFolder,
  emptyDir,
  fileStream,
  readFromFile,
} from '../fs/fs-utils.js';
import {
  existsInTar,
  filterEntries,
  requireEntry,
  TarService,
} from '../archive/tar/index.js';
import { MainLayer, PlatformLayer } from '../layer.js';
import { makeRunner, makeRunnerAsReturn } from '../runtime.js';
import path from 'path';
import { initLoggerFromEnv } from '../logger/pinoLogger.js';
import { tmpdir } from 'os';

await initLoggerFromEnv();
const nodeTestLayer = Layer.mergeAll(PlatformLayer, MainLayer);
const runNodeWithEnvOrThrow = makeRunner(nodeTestLayer);

const runNodeWithEnv = makeRunnerAsReturn(nodeTestLayer);

let compressDirectory: string;
let extractDirectory: string;
beforeAll(async () => {
  const program = Effect.gen(function* () {
    const tmpPath = tmpdir();
    const sourceDirectory = path.resolve('./tests');
    const destinationDirectory = path.join(tmpPath, 'compressTar');
    yield* emptyDir(destinationDirectory);
    yield* copyFolder(sourceDirectory, destinationDirectory);
    compressDirectory = destinationDirectory;
    extractDirectory = path.join(destinationDirectory, 'extract');
    yield* emptyDir(extractDirectory);
  });
  await runNodeWithEnvOrThrow(program);
});

const validateFileExistence = async (
  tarFilename: string,
  entryName: string,
  expected_result: boolean,
) => {
  const program = (path: string, entryName: string) =>
    fileStream(path).pipe(existsInTar(entryName));
  const result = await runNodeWithEnv(program(tarFilename, entryName));
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
    const entryNames: string[] = [];
    let readmeText = '';

    const program = Effect.gen(function* () {
      const tarPath = path.join(process.cwd(), 'tests', 'compress', 'temp.tar');
      const tarBytes = yield* readFromFile(tarPath);
      const tarStream = Stream.fromIterable([tarBytes]);
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
    });

    await runNodeWithEnvOrThrow(program, TarService.live);

    expect(entryNames).toContain('README.md');
    expect(entryNames).toContain('folder1/email_sender.py');
    expect(entryNames).toContain('setup.cfg');
    expect(readmeText.length).toBeGreaterThan(0);
    expect(readmeText).toContain('Gyomu');
  }, 15000);
  it('untar streaming test with filtering entries', async () => {
    // const rawRecords = await runWithEnv(
    //   Stream.runCollect(fileStream(inputFile).pipe(parseCsv())),
    // );
    const program = Effect.gen(function* () {
      const tarPath = path.join(process.cwd(), 'tests', 'compress', 'temp.tar');
      const tar = yield* TarService;
      return yield* fileStream(tarPath).pipe(
        tar.unarchive,
        filterEntries((header) => header.path == 'README.md'),
        Stream.runHead,
        Effect.flatMap(
          Option.match({
            onNone: () =>
              Effect.fail(
                new IOError({
                  message: `File not found: README.md`,
                  operation: 'read' as const,
                  layer: 'archive' as const,
                  cause: undefined,
                  target: 'README.me',
                }),
              ),
            onSome: (entry) => Effect.succeed(entry),
          }),
        ), // ここで見つからなければ IOError
        Effect.flatMap(tar.readTextEntry),
      );
    });
    const readMe = await runNodeWithEnvOrThrow(program, TarService.live);
    expect(readMe).not.toBeNull();
    expect(readMe).toContain('Gyomu');
    console.log(readMe);
  });
  it('untar streaming test with mandatory require Entry', async () => {
    const program = Effect.gen(function* () {
      const tarPath = path.join(process.cwd(), 'tests', 'compress', 'temp.tar');
      const tar = yield* TarService;
      return yield* fileStream(tarPath).pipe(
        tar.unarchive,
        requireEntry('README.md'), // ここで見つからなければ IOError
        Effect.flatMap(tar.readTextEntry),
      );
    });
    const readMe = await runNodeWithEnvOrThrow(program, TarService.live);
    expect(readMe).not.toBeNull();
    expect(readMe).toContain('Gyomu');
    //console.log(readMe);
  });
  it('Tar2 Unarchive Folder Test', async () => {
    const program = Effect.gen(function* () {
      const tar = yield* TarService;
      const transferInformation = new FileTransportInfo({
        sourceFolderName: 'folder1/folder 2',
        destinationFolderName: path.join(extractDirectory, 'folder 2'),
      });
      const tarFilename = path.join(compressDirectory, 'compress/temp.tar');
      yield* fileStream(tarFilename).pipe(tar.extract(transferInformation));
      validateFolders(
        path.join(compressDirectory, 'source/folder1/folder 2'),
        path.join(extractDirectory, 'folder 2'),
      );
    });
    const result = await runNodeWithEnv(program, TarService.live);
    // const archive: TarArchive = new TarArchive(
    //   path.join(compressDirectory, 'compress/temp.tar'),
    // );
    // let result = await archive.extract(transferInformation);
    //expect(result.isOk()).toBeTruthy();
    expect(Result.isSuccess(result)).toBeTruthy();
  });
  it('Tar Creation Test', async () => {
    //const extractDirectory = path.join(compressDirectory,'extracted');

    const program = Effect.gen(function* () {
      const sourceDirectory = path.join(compressDirectory, 'source');
      const tarFileName = path.join(compressDirectory, 'test_tar_create.tar');
      const tar = yield* TarService;
      yield* tar.create({
        tarFileName: tarFileName,
        cwd: sourceDirectory,
      });
      return tarFileName;
    });
    //const transferInformationList = [transferInformation];
    const result = await runNodeWithEnvOrThrow(program, TarService.live);

    expect(result).toBeTruthy();
    const tarFileName = result;
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

    const program2 = Effect.gen(function* () {
      const destinationRoot = path.join(extractDirectory, 'fullTarCreate');
      const tar = yield* TarService;
      yield* fileStream(tarFileName).pipe(
        tar.extractDirectory({ targetDir: destinationRoot }),
      );
      validateFolders(path.join(compressDirectory, 'source'), destinationRoot);
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const result2 = await runNodeWithEnvOrThrow(program2, TarService.live);
    //result = await archive.extractAll(destinationRoot);
  }, 10000);
  it('Tar Unarchive Test', async () => {
    let transferInformation: FileTransportInfo;
    let extractedFile: string;
    transferInformation = new FileTransportInfo({
      sourceFilename: 'README.md',
      destinationFolderName: extractDirectory,
    });

    const program = (transferInformation: FileTransportInfo) =>
      Effect.gen(function* () {
        const tar = yield* TarService;
        const tarFileName = path.join(compressDirectory, 'compress/temp.tar');
        yield* fileStream(tarFileName).pipe(tar.extract(transferInformation));
        return tarFileName;
      });
    let result = await runNodeWithEnvOrThrow(
      program(transferInformation),
      TarService.live,
    );
    const tarFileName = result;

    await runNodeWithEnvOrThrow(
      Effect.gen(function* () {
        extractedFile = path.join(extractDirectory, 'README.md');
        expect(
          compareFiles(
            extractedFile,
            path.join(compressDirectory, 'source/README.md'),
          ),
        ).toBeTruthy();
      }),
    );

    transferInformation = new FileTransportInfo({
      sourceFilename: 'email_sender.py',
      sourceFolderName: 'folder1',
      destinationFolderName: extractDirectory,
    });
    result = await runNodeWithEnvOrThrow(
      program(transferInformation),
      TarService.live,
    );

    await runNodeWithEnvOrThrow(
      Effect.gen(function* () {
        extractedFile = path.join(extractDirectory, 'email_sender.py');
        expect(
          compareFiles(
            extractedFile,
            path.join(compressDirectory, 'source/folder1/email_sender.py'),
          ),
        ).toBeTruthy();
      }),
    );
    await validateFileExistence(tarFileName, 'ユーザー噂.py', true);
    transferInformation = new FileTransportInfo({
      sourceFilename: 'ユーザー噂.py',
      destinationFolderName: extractDirectory,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    result = await runNodeWithEnvOrThrow(
      program(transferInformation),
      TarService.live,
    );
    await runNodeWithEnvOrThrow(
      Effect.gen(function* () {
        extractedFile = path.join(extractDirectory, 'ユーザー噂.py');
        expect(
          compareFiles(
            extractedFile,
            path.join(compressDirectory, 'source/ユーザー噂.py'),
          ),
        ).toBeTruthy();
      }),
    );
  }, 10000);
});
