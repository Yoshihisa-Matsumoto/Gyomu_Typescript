import { ZipArchive } from '../zip';
import fse from 'fs-extra';
import os, { tmpdir } from 'os';
import path from 'path';
import { FileTransportInfo } from '../../fileModel';
import fs from 'fs';

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

const getBufferFromFilenames = (
  sourceFilename: string,
  destinationFilename: string
): [Buffer, Buffer] => {
  const sourceBuffer = fs.readFileSync(sourceFilename);
  const destinationBuffer = fs.readFileSync(destinationFilename);
  return [sourceBuffer, destinationBuffer];
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
  let isExist = await archive.fileExists('README.md');
  expect(isExist).toBeTruthy();
  isExist = await archive.fileExists('README1.md');
  expect(isExist).toBeFalsy();
  isExist = await archive.fileExists('folder1/folder 2/aes_encryption.py');

  expect(isExist).toBeTruthy();
  isExist = await archive.fileExists('folder1\\folder 2\\aes_encryption.py');
  expect(isExist).toBeTruthy();

  isExist = await archive.fileExists('folder1\\folder 3\\aes_encryption.py');
  expect(isExist).toBeFalsy();

  isExist = await archive.fileExists('ユーザー噂.py');
  expect(isExist).toBeTruthy();
});

// test('Zip Creation with password Test', async () => {
//   //const extractDirectory = path.join(compressDirectory,'extracted');
//   const sourceDirectory = path.join(compressDirectory, 'source');
//   const zipFilename = path.join(
//     compressDirectory,
//     'test_zip_create_password.zip'
//   );
//   const transferInformation = new FileTransportInfo({
//     basePath: sourceDirectory,
//   });
//   const transferInformationList = [transferInformation];

//   let result = await ZipArchive.create(
//     zipFilename,
//     transferInformationList,
//     'SimplePassword'
//   );

//   expect(result.isSuccess()).toBeTruthy();
//   if (result.isSuccess()) {
//     Promise.allSettled([result.value]);
//   }
//   const checkFilename = path.join(sourceDirectory, 'README.md');
//   //const [sourceBuffer,destinationBuffer] = getBufferFromFilenames()
//   const archive: ZipArchive = new ZipArchive(zipFilename, 'SimplePassword');
//   let isExist = await archive.fileExists('README.md');
//   expect(isExist).toBeTruthy();
//   isExist = await archive.fileExists('README1.md');
//   expect(isExist).toBeFalsy();
//   isExist = await archive.fileExists('folder1/folder 2/aes_encryption.py');

//   expect(isExist).toBeTruthy();
//   isExist = await archive.fileExists('folder1\\folder 2\\aes_encryption.py');
//   expect(isExist).toBeTruthy();

//   isExist = await archive.fileExists('folder1\\folder 3\\aes_encryption.py');
//   expect(isExist).toBeFalsy();
// });

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

  let isExist = await archive.fileExists('ユーザー噂.py');
  expect(isExist).toBeFalsy();

  archive = new ZipArchive({
    zipFilename: path.join(compressDirectory, 'compress/temp.zip'),
    encoding: 'Shift_JIS',
  });
  isExist = await archive.fileExists('ユーザー噂.py');
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
  expect(
    compareFolders(
      path.join(compressDirectory, 'source/folder1/folder 2'),
      path.join(extractDirectory, 'folder 2')
    )
  ).toBeTruthy();
  expect(
    compareFoldersFromDest(
      path.join(compressDirectory, 'source/folder1/folder 2'),
      path.join(extractDirectory, 'folder 2')
    )
  ).toBeTruthy();

  let destinationRoot = path.join(extractDirectory, 'full');

  result = await archive.extractAll(destinationRoot);
  expect(result.isSuccess()).toBeTruthy();
  expect(
    compareFolders(path.join(compressDirectory, 'source'), destinationRoot)
  ).toBeTruthy();
  expect(
    compareFoldersFromDest(
      path.join(compressDirectory, 'source'),
      destinationRoot
    )
  ).toBeTruthy();
});

const compareFiles = (srcFile: string, destFile: string): boolean => {
  const result = fs.readFileSync(srcFile).equals(fs.readFileSync(destFile));
  if (!result) {
    console.log(srcFile, destFile);
  }
  return result;
};

const compareFolders = (srcFolder: string, destFolder: string): boolean => {
  fs.readdirSync(srcFolder, { withFileTypes: true }).forEach((dirent) => {
    const sourceFullPath = path.join(path.resolve(srcFolder), dirent.name);
    const targetDestFullPath = path.join(path.resolve(destFolder), dirent.name);
    if (dirent.isFile()) {
      expect(fs.existsSync(targetDestFullPath)).toBeTruthy();
      expect(compareFiles(sourceFullPath, targetDestFullPath)).toBeTruthy();
    } else {
      console.log(targetDestFullPath);
      expect(fs.existsSync(targetDestFullPath)).toBeTruthy();
      return compareFolders(sourceFullPath, targetDestFullPath);
    }
  });

  return true;
};
const compareFoldersFromDest = (
  srcFolder: string,
  destFolder: string
): boolean => {
  fs.readdirSync(destFolder, { withFileTypes: true }).forEach((dirent) => {
    const destinationFullPath = path.join(
      path.resolve(destFolder),
      dirent.name
    );
    const targetSourceFullPath = path.join(
      path.resolve(srcFolder),
      dirent.name
    );
    if (dirent.isFile()) {
      expect(fs.existsSync(targetSourceFullPath)).toBeTruthy();
    } else {
      expect(fs.existsSync(targetSourceFullPath)).toBeTruthy();
      return compareFoldersFromDest(targetSourceFullPath, destinationFullPath);
    }
  });

  return true;
};
