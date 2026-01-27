import { ZipArchive } from '../zip';

import { FileTransportInfo } from '../../fileModel';

import { compareFiles, validateFolders } from '../../__tests__/baseClass';

import { beforeAll, expect, test } from 'vitest';
import { platform } from '../../platform';

let compressDirectory: string;
let extractDirectory: string;
beforeAll(() => {
  const tmpPath = platform.tmpdir();
  const sourceDirectory = platform.resolve('./tests');
  const destinationDirectory = platform.join(tmpPath, 'compressZip');

  platform.emptyDirSync(destinationDirectory);
  platform.copySync(sourceDirectory, destinationDirectory);
  compressDirectory = destinationDirectory;
  extractDirectory = platform.join(destinationDirectory, 'extract');
  platform.emptyDirSync(extractDirectory);
});

// afterAll(() => {
//   const tmpPath = platform.tmpdir();
//   const destinationDirectory = platform.join(tmpPath, 'compress');
//   platform.removeSync(destinationDirectory);
// });

const validateFileExistence = async (
  archive: ZipArchive,
  entryName: string,
  expected_result: boolean
) => {
  const result = await archive.fileExists(entryName);
  if (result.isOk()) {
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
test('Zip Creation Test', async () => {
  //const extractDirectory = platform.join(compressDirectory,'extracted');
  const sourceDirectory = platform.join(compressDirectory, 'source');
  const zipFilename = platform.join(compressDirectory, 'test_zip_create.zip');
  const transferInformation = new FileTransportInfo({
    basePath: sourceDirectory,
  });
  const transferInformationList = [transferInformation];

  let result = await ZipArchive.create(zipFilename, transferInformationList);

  expect(result.isOk()).toBeTruthy();
  // if (result.isSuccess()) {
  //   Promise.allSettled([result.value]);
  // }
  //const checkFilename = platform.join(sourceDirectory, 'README.md');
  //const [sourceBuffer,destinationBuffer] = getBufferFromFilenames()
  const archive: ZipArchive = new ZipArchive({ zipFilename });
  //let isExist = await archive.fileExists('README.md');
  await validateFileExistence(archive, 'README.md', true);
  //isExist = await archive.fileExists('README1.md');
  await validateFileExistence(archive, 'README1.md', false);
  //isExist = await archive.fileExists('folder1/folder 2/aes_encryption.py');
  await validateFileExistence(
    archive,
    'folder1/folder 2/aes_encryption.py',
    true
  );
  //isExist = await archive.fileExists('folder1\\folder 2\\aes_encryption.py');
  await validateFileExistence(
    archive,
    'folder1\\folder 2\\aes_encryption.py',
    true
  );

  //isExist = await archive.fileExists('folder1\\folder 3\\aes_encryption.py');
  await validateFileExistence(
    archive,
    'folder1\\folder 3\\aes_encryption.py',
    false
  );

  //isExist = await archive.fileExists('ユーザー噂.py');
  await validateFileExistence(archive, 'ユーザー噂.py', true);

  const destinationRoot = platform.join(extractDirectory, 'fullZipCreate');

  result = await archive.extractAll(destinationRoot);
  expect(result.isOk()).toBeTruthy();
  validateFolders(platform.join(compressDirectory, 'source'), destinationRoot);
});

test('Zip Creation with password Test', async () => {
  //const extractDirectory = platform.join(compressDirectory,'extracted');
  const sourceDirectory = platform.join(compressDirectory, 'source');
  const zipFilename = platform.join(
    compressDirectory,
    'test_zip_create_password.zip'
  );
  const transferInformation = new FileTransportInfo({
    basePath: sourceDirectory,
  });
  const transferInformationList = [transferInformation];
  const password = 'SimplePassword';
  const result = await ZipArchive.create(
    zipFilename,
    transferInformationList,
    password
  );

  // password creation unsupported: expect failure
  expect(result.isOk()).toBeFalsy();
});

test('Zip Unarchive Test', async () => {
  let transferInformation: FileTransportInfo;
  let extractedFile: string;
  transferInformation = new FileTransportInfo({
    sourceFilename: 'README.md',
    destinationFileName: 'outputREADME.md',
    destinationFolderName: extractDirectory,
  });
  let archive: ZipArchive = new ZipArchive({
    zipFilename: platform.join(compressDirectory, 'compress/temp.zip'),
  });
  const result = await archive.extract(transferInformation);
  extractedFile = platform.join(extractDirectory, 'outputREADME.md');
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

  //let isExist = await archive.fileExists('ユーザー噂.py');
  await validateFileExistence(archive, 'ユーザー噂.py', false);

  archive = new ZipArchive({
    zipFilename: platform.join(compressDirectory, 'compress/temp.zip'),
    encoding: 'Shift_JIS',
  });
  //isExist = await archive.fileExists('ユーザー噂.py');
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
});
test('Zip Unarchive Folder Test', async () => {
  const transferInformation = new FileTransportInfo({
    sourceFolderName: 'folder1/folder 2',
    destinationFolderName: platform.join(extractDirectory, 'folder 2'),
  });
  const archive: ZipArchive = new ZipArchive({
    zipFilename: platform.join(compressDirectory, 'compress/temp.zip'),
    encoding: 'Shift_JIS',
  });
  let result = await archive.extract(transferInformation);
  expect(result.isOk()).toBeTruthy();
  validateFolders(
    platform.join(compressDirectory, 'source/folder1/folder 2'),
    platform.join(extractDirectory, 'folder 2')
  );

  const destinationRoot = platform.join(extractDirectory, 'fullZipExtract');

  result = await archive.extractAll(destinationRoot);
  expect(result.isOk()).toBeTruthy();
  validateFolders(platform.join(compressDirectory, 'source'), destinationRoot);
});
