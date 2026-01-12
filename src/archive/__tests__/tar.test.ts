import { TarArchive } from '../tar';

import { FileTransportInfo } from '../../fileModel';
import fs from 'fs';
import { compareFiles, validateFolders } from '../../__tests__/baseClass';
import { beforeAll, expect, test } from 'vitest';
import { platform } from '../../platform';

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
  archive: TarArchive,
  entryName: string,
  expected_result: boolean
) => {
  let result = await archive.fileExists(entryName);
  if (result.isSuccess()) {
    if (result.value !== expected_result) {
      console.log(
        entryName,
        'Different from expected result:',
        expected_result
      );
    }
    expect(result.value).toBe(expected_result);
  } else {
    console.log(result.error);
    expect(false).toBeTruthy();
  }
};

test('Tar Creation Test', async () => {
  //const extractDirectory = platform.join(compressDirectory,'extracted');
  const sourceDirectory = platform.join(compressDirectory, 'source');
  const tarFileName = platform.join(compressDirectory, 'test_tar_create.tar');
  const transferInformation = new FileTransportInfo({
    basePath: sourceDirectory,
  });
  const transferInformationList = [transferInformation];

  let result = await TarArchive.create(tarFileName, transferInformation);

  expect(result.isSuccess()).toBeTruthy();

  // const checkFilename = platform.join(sourceDirectory, 'README.md');
  // //const [sourceBuffer,destinationBuffer] = getBufferFromFilenames()
  let archive: TarArchive = new TarArchive(tarFileName);

  await validateFileExistence(archive, 'README.md', true);
  await validateFileExistence(archive, 'README1.md', false);

  await validateFileExistence(
    archive,
    'folder1/folder 2/aes_encryption.py',
    true
  );

  await validateFileExistence(
    archive,
    'folder1\\folder 2\\aes_encryption.py',
    true
  );

  await validateFileExistence(
    archive,
    'folder1\\folder 3\\aes_encryption.py',
    false
  );
  await validateFileExistence(archive, 'ユーザー噂.py', true);

  let destinationRoot = platform.join(extractDirectory, 'fullTarCreate');
  result = await archive.extractAll(destinationRoot);
  expect(result.isSuccess()).toBeTruthy();
  validateFolders(platform.join(compressDirectory, 'source'), destinationRoot);
}, 10000);

test('Tar Unarchive Test', async () => {
  let transferInformation: FileTransportInfo;
  let extractedFile: string;
  transferInformation = new FileTransportInfo({
    sourceFilename: 'README.md',
    destinationFolderName: extractDirectory,
  });
  let archive: TarArchive = new TarArchive(
    platform.join(compressDirectory, 'compress/temp.tar')
  );
  const result = await archive.extract(transferInformation);
  extractedFile = platform.join(extractDirectory, 'README.md');
  expect(
    compareFiles(
      extractedFile,
      platform.join(compressDirectory, 'source/README.md')
    )
  ).toBeTruthy();

  transferInformation = new FileTransportInfo({
    sourceFilename: 'email_sender.py',
    sourceFolderName: 'folder1',
    destinationFolderName: extractDirectory,
  });
  await archive.extract(transferInformation);
  extractedFile = platform.join(extractDirectory, 'email_sender.py');
  expect(
    compareFiles(
      extractedFile,
      platform.join(compressDirectory, 'source/folder1/email_sender.py')
    )
  ).toBeTruthy();

  await validateFileExistence(archive, 'ユーザー噂.py', true);

  transferInformation = new FileTransportInfo({
    sourceFilename: 'ユーザー噂.py',
    destinationFolderName: extractDirectory,
  });
  await archive.extract(transferInformation);
  extractedFile = platform.join(extractDirectory, 'ユーザー噂.py');
  expect(
    compareFiles(
      extractedFile,
      platform.join(compressDirectory, 'source/ユーザー噂.py')
    )
  ).toBeTruthy();
}, 10000);
test('Tar Unarchive Folder Test', async () => {
  let transferInformation: FileTransportInfo;
  let extractedFile: string;
  transferInformation = new FileTransportInfo({
    sourceFolderName: 'folder1/folder 2',
    destinationFolderName: platform.join(extractDirectory, 'folder 2'),
  });
  let archive: TarArchive = new TarArchive(
    platform.join(compressDirectory, 'compress/temp.tar')
  );
  let result = await archive.extract(transferInformation);
  expect(result.isSuccess()).toBeTruthy();
  validateFolders(
    platform.join(compressDirectory, 'source/folder1/folder 2'),
    platform.join(extractDirectory, 'folder 2')
  );

  let destinationRoot = platform.join(extractDirectory, 'fullTarExtract');

  result = await archive.extractAll(destinationRoot);
  expect(result.isSuccess()).toBeTruthy();
  validateFolders(platform.join(compressDirectory, 'source'), destinationRoot);
}, 10000);
