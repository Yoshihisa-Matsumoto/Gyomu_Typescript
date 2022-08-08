import { ZipArchive } from '../zip';
import fse from 'fs-extra';
import os, { tmpdir } from 'os';
import path from 'path';
import { FileTransportInfo } from '../../fileModel';
import fs from 'fs';
import { compareFiles, validateFolders } from '../../__tests__/baseClass';
import { ArchiveError } from '../../errors';
import { PromiseResult, Result } from '../../result';
import { FileOperation } from '../../fileOperation';

let compressDirectory: string;
let extractDirectory: string;
beforeAll(() => {
  const tmpPath = os.tmpdir();
  const sourceDirectory = path.resolve('./tests');
  const destinationDirectory = path.join(tmpPath, 'compress');

  fse.emptydirSync(destinationDirectory);
  fse.copySync(sourceDirectory, destinationDirectory);
  compressDirectory = destinationDirectory;
  extractDirectory = path.join(destinationDirectory, 'extract');
  fse.emptyDirSync(extractDirectory);
});

// afterAll(() => {
//   const tmpPath = os.tmpdir();
//   const destinationDirectory = path.join(tmpPath, 'compress');
//   fse.removeSync(destinationDirectory);
// });

const validateFileExistence = async (
  archive: ZipArchive,
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
test('Zip Creation Test', async () => {
  //const extractDirectory = path.join(compressDirectory,'extracted');
  const sourceDirectory = path.join(compressDirectory, 'source');
  const zipFilename = path.join(compressDirectory, 'test_zip_create.zip');
  const transferInformation = new FileTransportInfo({
    basePath: sourceDirectory,
  });
  const transferInformationList = [transferInformation];

  let result = await ZipArchive.create(zipFilename, transferInformationList);

  expect(result.isSuccess()).toBeTruthy();
  // if (result.isSuccess()) {
  //   Promise.allSettled([result.value]);
  // }
  const checkFilename = path.join(sourceDirectory, 'README.md');
  //const [sourceBuffer,destinationBuffer] = getBufferFromFilenames()
  let archive: ZipArchive = new ZipArchive({ zipFilename });
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

  let destinationRoot = path.join(extractDirectory, 'fullZipCreate');

  result = await archive.extractAll(destinationRoot);
  expect(result.isSuccess()).toBeTruthy();
  validateFolders(path.join(compressDirectory, 'source'), destinationRoot);
});

test('Zip Creation with password Test', async () => {
  //const extractDirectory = path.join(compressDirectory,'extracted');
  const sourceDirectory = path.join(compressDirectory, 'source');
  const zipFilename = path.join(
    compressDirectory,
    'test_zip_create_password.zip'
  );
  const transferInformation = new FileTransportInfo({
    basePath: sourceDirectory,
  });
  const transferInformationList = [transferInformation];
  const password = 'SimplePassword';
  let result;

  result = await ZipArchive.create(
    zipFilename,
    transferInformationList,
    password
  );

  expect(result.isSuccess()).toBeTruthy();

  console.log('Create with Password completed', new Date());
  //const [sourceBuffer,destinationBuffer] = getBufferFromFilenames()
  const archive: ZipArchive = new ZipArchive({
    zipFilename,
    password: password,
  });

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

  let destinationRoot = path.join(extractDirectory, 'fullZipCreatePassword');

  result = await archive.extractAll(destinationRoot);
  expect(result.isSuccess()).toBeTruthy();
  validateFolders(path.join(compressDirectory, 'source'), destinationRoot);
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
    zipFilename: path.join(compressDirectory, 'compress/temp.zip'),
  });
  const result = await archive.extract(transferInformation);
  extractedFile = path.join(extractDirectory, 'outputREADME.md');
  expect(
    compareFiles(
      extractedFile,
      path.join(compressDirectory, 'source/README.md')
    )
  ).toBeTruthy();

  transferInformation = new FileTransportInfo({
    sourceFilename: 'email_sender.py',
    sourceFolderName: 'folder1',
    destinationFolderName: extractDirectory,
  });
  await archive.extract(transferInformation);
  extractedFile = path.join(extractDirectory, 'email_sender.py');
  expect(
    compareFiles(
      extractedFile,
      path.join(compressDirectory, 'source/folder1/email_sender.py')
    )
  ).toBeTruthy();

  //let isExist = await archive.fileExists('ユーザー噂.py');
  await validateFileExistence(archive, 'ユーザー噂.py', false);

  archive = new ZipArchive({
    zipFilename: path.join(compressDirectory, 'compress/temp.zip'),
    encoding: 'Shift_JIS',
  });
  //isExist = await archive.fileExists('ユーザー噂.py');
  await validateFileExistence(archive, 'ユーザー噂.py', true);

  transferInformation = new FileTransportInfo({
    sourceFilename: 'ユーザー噂.py',
    destinationFolderName: extractDirectory,
  });
  await archive.extract(transferInformation);
  extractedFile = path.join(extractDirectory, 'ユーザー噂.py');
  expect(
    compareFiles(
      extractedFile,
      path.join(compressDirectory, 'source/ユーザー噂.py')
    )
  ).toBeTruthy();
});
test('Zip Unarchive Folder Test', async () => {
  let transferInformation: FileTransportInfo;
  let extractedFile: string;
  transferInformation = new FileTransportInfo({
    sourceFolderName: 'folder1/folder 2',
    destinationFolderName: path.join(extractDirectory, 'folder 2'),
  });
  let archive: ZipArchive = new ZipArchive({
    zipFilename: path.join(compressDirectory, 'compress/temp.zip'),
    encoding: 'Shift_JIS',
  });
  let result = await archive.extract(transferInformation);
  expect(result.isSuccess()).toBeTruthy();
  validateFolders(
    path.join(compressDirectory, 'source/folder1/folder 2'),
    path.join(extractDirectory, 'folder 2')
  );

  let destinationRoot = path.join(extractDirectory, 'fullZipExtract');

  result = await archive.extractAll(destinationRoot);
  expect(result.isSuccess()).toBeTruthy();
  validateFolders(path.join(compressDirectory, 'source'), destinationRoot);
});
