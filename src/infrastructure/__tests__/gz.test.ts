import { beforeAll, expect, test } from 'vitest';
import { fs } from '../fs/index.js';
import { gunzip, gzip } from '../archive/gz.js';
import { fileStream, writeToFile } from '../../infrastructure/fs/fs-utils.js';
import { compareFiles } from './baseClass.js';
import { makeRunner } from '../../infrastructure/runtime.js';
import { Layer } from 'effect';
import { MainLayer, PlatformLayer } from '../../infrastructure/layer.js';

const nodeTestLayer = Layer.mergeAll(MainLayer, PlatformLayer);
const runNodeWithEnvOrThrow = makeRunner(nodeTestLayer);

let compressDirectory: string;
let extractDirectory: string;
beforeAll(() => {
  const tmpPath = fs.tmpdir();
  const sourceDirectory = fs.resolve('./tests');
  const destinationDirectory = fs.join(tmpPath, 'compressGz');

  fs.emptyDirSync(destinationDirectory);
  fs.copySync(sourceDirectory, destinationDirectory);
  compressDirectory = destinationDirectory;
  extractDirectory = fs.join(destinationDirectory, 'extract');
  fs.emptyDirSync(extractDirectory);
});

test('GZ Creation Test', async () => {
  //const extractDirectory = platform.join(compressDirectory,'extracted');
  const sourceDirectory = fs.join(compressDirectory, 'source');
  const gzFilename = fs.join(compressDirectory, 'test_gz_create.gz');
  const targetSourceFilename = fs.join(sourceDirectory, 'README.md');

  await runNodeWithEnvOrThrow(
    fileStream(targetSourceFilename).pipe(gzip(), writeToFile(gzFilename)),
  );
  // expect(result.isOk()).toBeTruthy();

  let isSame: boolean = true;
  // let isSame = compareFiles(
  //   gzFilename,
  //   platform.join(compressDirectory, 'compress/README.md.gz')
  // );
  // expect(isSame).toBeTruthy();

  // const checkFilename = platform.join(sourceDirectory, 'README.md');
  // //const [sourceBuffer,destinationBuffer] = getBufferG
  const extractedFilename = fs.join(extractDirectory, 'README.md');
  await runNodeWithEnvOrThrow(
    fileStream(gzFilename).pipe(gunzip(), writeToFile(extractedFilename)),
  );

  isSame = compareFiles(
    extractedFilename,
    fs.join(sourceDirectory, 'README.md'),
  );
  expect(isSame).toBeTruthy();
});
