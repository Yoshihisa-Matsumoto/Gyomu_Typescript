import { beforeAll, describe, expect, it } from 'vitest';
import { platform } from '../../fs/index.js';
import { copyFolder, emptyDir, writeStreamToFile } from '../../fs/fs-utils.js';
import { compareFiles, validateFolders } from '../baseClass.js';
import { Effect, Layer, Stream, FileSystem } from 'effect';
import {
  existsInZip,
  // extractZip,
  // extractZipAll,
  // openZipEntries,
  exportedForTesting,
} from '../../archive/zip/internals/read.js';
import { FileTransportInfo } from '../../../gyomu/file/transport.js';
import { ZipService } from '../../archive/zip/index.js';
import { compareZip } from '../../archive/zip/compare.js';
import { MainLayer, PlatformLayer } from '../../layer.js';
import { makeRunner } from '../../runtime.js';

const nodeTestLayer = Layer.mergeAll(PlatformLayer, MainLayer);
const runNodeWithEnvOrThrow = makeRunner(nodeTestLayer);

let compressDirectory: string;
let extractDirectory: string;
beforeAll(async () => {
  await runNodeWithEnvOrThrow(
    Effect.gen(function* () {
      const tmpPath = platform.tmpdir();
      const sourceDirectory = platform.resolve('./tests');
      const destinationDirectory = platform.join(tmpPath, 'compressZip');

      yield* emptyDir(destinationDirectory);
      yield* copyFolder(sourceDirectory, destinationDirectory);
      compressDirectory = destinationDirectory;
      extractDirectory = platform.join(destinationDirectory, 'extract');
      yield* emptyDir(extractDirectory);
    }),
  );
});
describe('Zip resolvePath test', () => {
  it('resolvePath', async () => {
    let transferInformation: FileTransportInfo;
    let output: string;
    transferInformation = new FileTransportInfo({
      sourceFilename: 'README.md',
      destinationFileName: 'outputREADME.md',
      destinationFolderName: extractDirectory,
    });
    output = await runNodeWithEnvOrThrow(
      exportedForTesting.resolvePath(
        {
          _tag: 'zip',
          crc32: 0,
          isDirectory: false,
          path: 'README.md',
          uncompressedSize: 0,
          openStream: () => Stream.empty,
        },
        transferInformation,
      ),
    );
    expect(output).toBe(
      `C:\\Users\\yoshm\\AppData\\Local\\Temp\\compressZip\\extract\\outputREADME.md`,
    );

    transferInformation = new FileTransportInfo({
      sourceFilename: 'email_sender.py',
      sourceFolderName: 'folder1',
      destinationFolderName: extractDirectory,
    });
    output = await runNodeWithEnvOrThrow(
      exportedForTesting.resolvePath(
        {
          _tag: 'zip',
          crc32: 0,
          isDirectory: false,
          path: 'folder1/email_sender.py',
          uncompressedSize: 0,
          openStream: () => Stream.empty,
        },
        transferInformation,
      ),
    );
    expect(output).toBe(
      `C:\\Users\\yoshm\\AppData\\Local\\Temp\\compressZip\\extract\\email_sender.py`,
    );

    transferInformation = new FileTransportInfo({
      sourceFolderName: 'folder1/folder 2',
      destinationFolderName: platform.join(extractDirectory, 'folder 2'),
    });
    output = await runNodeWithEnvOrThrow(
      exportedForTesting.resolvePath(
        {
          _tag: 'zip',
          crc32: 0,

          isDirectory: false,
          path: 'foder1/folder 2/aes_encryption.py',
          uncompressedSize: 0,
          openStream: () => Stream.empty,
        },
        transferInformation,
      ),
    );
    expect(output).toBe(
      `C:\\Users\\yoshm\\AppData\\Local\\Temp\\compressZip\\extract\\folder 2\\aes_encryption.py`,
    );

    output = await runNodeWithEnvOrThrow(
      exportedForTesting.resolvePath(
        {
          _tag: 'zip',
          isDirectory: true,
          path: 'foder1/folder 2/folder4',
        },
        transferInformation,
      ),
    );
    expect(output).toBe(
      `C:\\Users\\yoshm\\AppData\\Local\\Temp\\compressZip\\extract\\folder 2\\folder4`,
    );
  });
});
describe('Zip Test', () => {
  it('Dictionary Check', async () => {
    const program = (filePath: string) =>
      Effect.scoped(
        Effect.gen(function* () {
          const zip = yield* ZipService;
          return yield* zip.unarchiveFromFile(filePath, 'shift-jis').pipe(
            Stream.tap((entry) => Effect.sync(() => console.log(entry.path))),
            Stream.runDrain,
          );
        }),
      );

    await runNodeWithEnvOrThrow(
      program('tests/compress/temp.zip'),
      ZipService.live,
    );
  });
  it('Effect File Entry Check', async () => {
    const program = (filePath: string) =>
      Effect.scoped(
        Effect.gen(function* () {
          const zip = yield* ZipService;
          const entries = yield* zip
            .unarchiveFromFile(filePath, 'shift-jis')
            .pipe(Stream.runCollect);

          // 実際に解凍する場合は、withZipFileのScopeの中で処理が必要
          expect(yield* existsInZip('README.md')(entries)).toBeTruthy();
          expect(yield* existsInZip('README1.md')(entries)).toBeFalsy();
          expect(
            yield* existsInZip('folder1\\folder 2\\aes_encryption.py')(entries),
          ).toBeTruthy();
          expect(
            yield* existsInZip('folder1\\folder 3\\aes_encryption.py')(entries),
          ).toBeFalsy();
          expect(yield* existsInZip('ユーザー噂.py')(entries)).toBeTruthy();
        }),
      );
    await runNodeWithEnvOrThrow(
      program('tests/compress/temp.zip'),
      ZipService.live,
    );
  });
  it('Zip Creation Test', async () => {
    //const extractDirectory = platform.join(compressDirectory,'extracted');
    const sourceDirectory = platform.join(compressDirectory, 'source');
    const zipFilename = platform.join(compressDirectory, 'test_zip_create.zip');
    const transferInformation = new FileTransportInfo({
      basePath: sourceDirectory,
    });
    const transferInformationList = [transferInformation];

    const program = (zipFilename: string) =>
      Effect.scoped(
        Effect.gen(function* () {
          const zip = yield* ZipService;
          yield* zip
            .create(transferInformationList)
            .pipe(writeStreamToFile(zipFilename));
          const entries = yield* zip
            .unarchiveFromFile(zipFilename, 'shift-jis')
            .pipe(Stream.runCollect);

          // 実際に解凍する場合は、withZipFileのScopeの中で処理が必要
          expect(yield* existsInZip('README.md')(entries)).toBeTruthy();
          expect(yield* existsInZip('README1.md')(entries)).toBeFalsy();
          expect(
            yield* existsInZip('folder1\\folder 2\\aes_encryption.py')(entries),
          ).toBeTruthy();
          expect(
            yield* existsInZip('folder1\\folder 3\\aes_encryption.py')(entries),
          ).toBeFalsy();
          expect(yield* existsInZip('ユーザー噂.py')(entries)).toBeTruthy();
        }),
      );
    await runNodeWithEnvOrThrow(program(zipFilename), ZipService.live);
    //validateFolders(platform.join(compressDirectory, 'source'), destinationRoot);
  });
  it('ZipEffect1 Unarchive Test', async () => {
    let transferInformation: FileTransportInfo;
    let extractedFile: string;
    transferInformation = new FileTransportInfo({
      sourceFilename: 'README.md',
      destinationFileName: 'outputREADME.md',
      destinationFolderName: extractDirectory,
    });
    const zipFilename = platform.join(compressDirectory, 'compress/temp.zip');
    const program = (
      zipFilename: string,
      transferInformation: FileTransportInfo,
    ) =>
      Effect.scoped(
        Effect.gen(function* () {
          const zip = yield* ZipService;
          return yield* zip
            .unarchiveFromFile(zipFilename, 'shift-jis')
            .pipe(zip.extract(transferInformation));
        }),
      );
    await runNodeWithEnvOrThrow(
      program(zipFilename, transferInformation),
      ZipService.live,
    );
    extractedFile = platform.join(extractDirectory, 'outputREADME.md');
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

    await runNodeWithEnvOrThrow(
      program(zipFilename, transferInformation),
      ZipService.live,
    );
    extractedFile = platform.join(extractDirectory, 'email_sender.py');
    expect(
      compareFiles(
        extractedFile,
        platform.join(compressDirectory, 'source/folder1/email_sender.py'),
      ),
    ).toBeTruthy();

    transferInformation = new FileTransportInfo({
      sourceFilename: 'ユーザー噂.py',
      destinationFolderName: extractDirectory,
    });
    await runNodeWithEnvOrThrow(
      program(zipFilename, transferInformation),
      ZipService.live,
    );
    extractedFile = platform.join(extractDirectory, 'ユーザー噂.py');
    expect(
      compareFiles(
        extractedFile,
        platform.join(compressDirectory, 'source/ユーザー噂.py'),
      ),
    ).toBeTruthy();
  });

  it('ZipEffectUnarchive Folder Test', async () => {
    const transferInformation = new FileTransportInfo({
      sourceFolderName: 'folder1/folder 2',
      destinationFolderName: platform.join(extractDirectory, 'folder 2'),
    });
    const zipFilename = platform.join(compressDirectory, 'compress/temp.zip');

    const program = (
      zipFilename: string,
      transferInformation: FileTransportInfo,
    ) =>
      Effect.scoped(
        Effect.gen(function* () {
          const zip = yield* ZipService;
          return yield* zip
            .unarchiveFromFile(zipFilename, 'shift-jis')
            .pipe(zip.extract(transferInformation));
        }),
      );
    await runNodeWithEnvOrThrow(
      program(zipFilename, transferInformation),
      ZipService.live,
    );
    validateFolders(
      platform.join(compressDirectory, 'source/folder1/folder 2'),
      platform.join(extractDirectory, 'folder 2'),
    );

    const destinationRoot = platform.join(extractDirectory, 'fullZipExtract');
    const program2 = (zipFilename: string, destinationFolder: string) =>
      Effect.scoped(
        Effect.gen(function* () {
          const zip = yield* ZipService;
          return yield* zip
            .unarchiveFromFile(zipFilename, 'shift-jis')
            .pipe(zip.extractAll(destinationFolder));
        }),
      );
    await runNodeWithEnvOrThrow(
      program2(zipFilename, destinationRoot),
      ZipService.live,
    );
    validateFolders(
      platform.join(compressDirectory, 'source'),
      destinationRoot,
    );
  });
});
describe('ZipCompare test', () => {
  it('Zip Compare Test', async () => {
    const program = await compareZip({
      sourceFilename: platform.join(
        compressDirectory,
        'compress\\compare1.zip',
      ),
      destinationFilename: platform.join(
        compressDirectory,
        'compress\\compare2.zip',
      ),
      resultPath: platform.join(compressDirectory, 'zipCompare'),
      recordDelimiter: 'unix',
    });
    await runNodeWithEnvOrThrow(program, ZipService.live);

    expect(
      compareFiles(
        platform.join(compressDirectory, 'zipCompareResult.csv'),
        platform.join(compressDirectory, 'zipCompare\\@summary.csv'),
      ),
    ).toBeTruthy();
  });
});
