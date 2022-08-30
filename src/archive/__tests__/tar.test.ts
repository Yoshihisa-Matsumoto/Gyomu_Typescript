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
  const destinationDirectory = path.join(tmpPath, 'compressTar');

  fse.emptydirSync(destinationDirectory);
  fse.copySync(sourceDirectory, destinationDirectory);
  compressDirectory = destinationDirectory;
  extractDirectory = path.join(destinationDirectory, 'extract');
  fse.emptyDirSync(extractDirectory);
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
