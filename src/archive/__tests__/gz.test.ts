import { GzipArchive } from '../gz';
import fse from 'fs-extra';
import os, { tmpdir } from 'os';
import path from 'path';
import { FileTransportInfo } from '../../fileModel';
import fs from 'fs';
import { compareFiles } from '../../__tests__/baseClass';

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

test('GZ Creation Test', async () => {
  //const extractDirectory = path.join(compressDirectory,'extracted');
  const sourceDirectory = path.join(compressDirectory, 'source');
  const gzFilename = path.join(compressDirectory, 'test_gz_create.gz');
  const targetSourceFilename = path.join(sourceDirectory, 'README.md');

  let result = await GzipArchive.create(gzFilename, targetSourceFilename);

  expect(result.isSuccess()).toBeTruthy();

  let isSame: boolean = true;
  // let isSame = compareFiles(
  //   gzFilename,
  //   path.join(compressDirectory, 'compress/README.md.gz')
  // );
  // expect(isSame).toBeTruthy();

  // const checkFilename = path.join(sourceDirectory, 'README.md');
  // //const [sourceBuffer,destinationBuffer] = getBufferG
  const extractedFilename = path.join(extractDirectory, 'README.md');
  result = await GzipArchive.extract(gzFilename, extractedFilename);
  expect(result.isSuccess()).toBeTruthy();

  isSame = compareFiles(
    extractedFilename,
    path.join(sourceDirectory, 'README.md')
  );
  expect(isSame).toBeTruthy();
});
