import { TarArchive } from '../tar';
import fse from 'fs-extra';
import os, { tmpdir } from 'os';
import path from 'path';
import { FileTransportInfo } from '../../fileModel';
import fs from 'fs';
import { compareFiles, validateFolders } from '../../__tests__/baseClass';

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

test('Tar Creation Test', async () => {
  //const extractDirectory = path.join(compressDirectory,'extracted');
  const sourceDirectory = path.join(compressDirectory, 'source');
  const tarFileName = path.join(compressDirectory, 'test_tar_create.tar');
  const transferInformation = new FileTransportInfo({
    basePath: sourceDirectory,
  });
  const transferInformationList = [transferInformation];

  let result = await TarArchive.create(tarFileName, transferInformation);

  expect(result.isSuccess()).toBeTruthy();

  // const checkFilename = path.join(sourceDirectory, 'README.md');
  // //const [sourceBuffer,destinationBuffer] = getBufferFromFilenames()
  let archive: TarArchive = new TarArchive(tarFileName);
  let isExist = await archive.fileExists('README.md');
  let isSuccess = isExist.isSuccess();
  if (isExist.isSuccess()) {
    expect(isExist.value).toBeTruthy();
  }
  expect(isSuccess).toBeTruthy();

  isExist = await archive.fileExists('README1.md');
  isSuccess = isExist.isSuccess();
  if (isExist.isSuccess()) {
    expect(isExist.value).toBeFalsy();
  }
  expect(isSuccess).toBeTruthy();

  isExist = await archive.fileExists('folder1/folder 2/aes_encryption.py');
  isSuccess = isExist.isSuccess();
  if (isExist.isSuccess()) {
    expect(isExist.value).toBeTruthy();
  }
  expect(isSuccess).toBeTruthy();

  isExist = await archive.fileExists('folder1\\folder 2\\aes_encryption.py');
  isSuccess = isExist.isSuccess();
  if (isExist.isSuccess()) {
    expect(isExist.value).toBeTruthy();
  }
  expect(isSuccess).toBeTruthy();

  isExist = await archive.fileExists('folder1\\folder 3\\aes_encryption.py');
  isSuccess = isExist.isSuccess();
  if (isExist.isSuccess()) {
    expect(isExist.value).toBeFalsy();
  }
  expect(isSuccess).toBeTruthy();

  isExist = await archive.fileExists('ユーザー噂.py');
  isSuccess = isExist.isSuccess();
  if (isExist.isSuccess()) {
    expect(isExist.value).toBeTruthy();
  }
  expect(isSuccess).toBeTruthy();

  let destinationRoot = path.join(extractDirectory, 'fullTarCreate');
  result = await archive.extractAll(destinationRoot);
  expect(result.isSuccess()).toBeTruthy();
  validateFolders(path.join(compressDirectory, 'source'), destinationRoot);
});

test('Tar Unarchive Test', async () => {
  let transferInformation: FileTransportInfo;
  let extractedFile: string;
  transferInformation = new FileTransportInfo({
    sourceFilename: 'README.md',
    destinationFolderName: extractDirectory,
  });
  let archive: TarArchive = new TarArchive(
    path.join(compressDirectory, 'compress/temp.tar')
  );
  const result = await archive.extract(transferInformation);
  extractedFile = path.join(extractDirectory, 'README.md');
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

  let isExist = await archive.fileExists('ユーザー噂.py');
  expect(isExist).toBeTruthy();

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
test('Tar Unarchive Folder Test', async () => {
  let transferInformation: FileTransportInfo;
  let extractedFile: string;
  transferInformation = new FileTransportInfo({
    sourceFolderName: 'folder1/folder 2',
    destinationFolderName: path.join(extractDirectory, 'folder 2'),
  });
  let archive: TarArchive = new TarArchive(
    path.join(compressDirectory, 'compress/temp.tar')
  );
  let result = await archive.extract(transferInformation);
  expect(result.isSuccess()).toBeTruthy();
  validateFolders(
    path.join(compressDirectory, 'source/folder1/folder 2'),
    path.join(extractDirectory, 'folder 2')
  );

  let destinationRoot = path.join(extractDirectory, 'fullTarExtract');

  result = await archive.extractAll(destinationRoot);
  expect(result.isSuccess()).toBeTruthy();
  validateFolders(path.join(compressDirectory, 'source'), destinationRoot);
});
