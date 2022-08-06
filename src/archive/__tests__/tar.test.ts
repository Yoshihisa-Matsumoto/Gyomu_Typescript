import { TarArchive } from '../tar';
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

test('Tar Creation Test', async () => {
  //const extractDirectory = path.join(compressDirectory,'extracted');
  const sourceDirectory = path.join(compressDirectory, 'source');
  const tarFileName = path.join(compressDirectory, 'test_tar_create.tar');
  const transferInformation = new FileTransportInfo({
    basePath: sourceDirectory,
  });
  const transferInformationList = [transferInformation];

  let result = await TarArchive.create(tarFileName, transferInformationList);

  expect(result.isSuccess()).toBeTruthy();
  // if (result.isSuccess()) {
  //   Promise.allSettled([result.value]);
  // }
  // const checkFilename = path.join(sourceDirectory, 'README.md');
  // //const [sourceBuffer,destinationBuffer] = getBufferFromFilenames()
  // let archive: TarArchive = new TarArchive({ tarFilename });
  // let isExist = await archive.fileExists('README.md');
  // expect(isExist).toBeTruthy();
  // isExist = await archive.fileExists('README1.md');
  // expect(isExist).toBeFalsy();
  // isExist = await archive.fileExists('folder1/folder 2/aes_encryption.py');

  // expect(isExist).toBeTruthy();
  // isExist = await archive.fileExists('folder1\\folder 2\\aes_encryption.py');
  // expect(isExist).toBeTruthy();

  // isExist = await archive.fileExists('folder1\\folder 3\\aes_encryption.py');
  // expect(isExist).toBeFalsy();

  // isExist = await archive.fileExists('ユーザー噂.py');
  // expect(isExist).toBeTruthy();
});
