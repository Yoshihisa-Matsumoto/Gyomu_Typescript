import { GzipArchive } from '../gz';

import { FileTransportInfo } from '../../fileModel';

import { compareFiles } from '../../__tests__/baseClass';
import { beforeAll, expect, test } from 'vitest';
import { platform } from '../../platform';

let compressDirectory: string;
let extractDirectory: string;
beforeAll(() => {
  const tmpPath = platform.tmpdir();
  const sourceDirectory = platform.resolve('./tests');
  const destinationDirectory = platform.join(tmpPath, 'compressGz');

  platform.emptyDirSync(destinationDirectory);
  platform.copySync(sourceDirectory, destinationDirectory);
  compressDirectory = destinationDirectory;
  extractDirectory = platform.join(destinationDirectory, 'extract');
  platform.emptyDirSync(extractDirectory);
});

test('GZ Creation Test', async () => {
  //const extractDirectory = platform.join(compressDirectory,'extracted');
  const sourceDirectory = platform.join(compressDirectory, 'source');
  const gzFilename = platform.join(compressDirectory, 'test_gz_create.gz');
  const targetSourceFilename = platform.join(sourceDirectory, 'README.md');

  let result = await GzipArchive.create(gzFilename, targetSourceFilename);

  expect(result.isOk()).toBeTruthy();

  let isSame: boolean = true;
  // let isSame = compareFiles(
  //   gzFilename,
  //   platform.join(compressDirectory, 'compress/README.md.gz')
  // );
  // expect(isSame).toBeTruthy();

  // const checkFilename = platform.join(sourceDirectory, 'README.md');
  // //const [sourceBuffer,destinationBuffer] = getBufferG
  const extractedFilename = platform.join(extractDirectory, 'README.md');
  result = await GzipArchive.extract(gzFilename, extractedFilename);
  expect(result.isOk()).toBeTruthy();

  isSame = compareFiles(
    extractedFilename,
    platform.join(sourceDirectory, 'README.md')
  );
  expect(isSame).toBeTruthy();
});
