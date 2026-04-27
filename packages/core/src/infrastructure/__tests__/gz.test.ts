import { beforeAll, expect, test } from 'vitest';
import { platform } from '../fs/index.js';
import { gunzip, gzip } from '../archive/gz.js';
import {
  copyFolder,
  emptyDir,
  fileStream,
  writeStreamToFile,
} from '../../infrastructure/fs/fs-utils.js';
import { compareFiles } from './baseClass.js';
import { makeRunner } from '../../infrastructure/runtime.js';
import { Effect, Layer } from 'effect';
import { MainLayer, PlatformLayer } from '../../infrastructure/layer.js';

const nodeTestLayer = Layer.mergeAll(MainLayer, PlatformLayer);
const runNodeWithEnvOrThrow = makeRunner(nodeTestLayer);

let compressDirectory: string;
let extractDirectory: string;
beforeAll(async () => {
  const tmpPath = platform.tmpdir();
  const sourceDirectory = platform.resolve('./tests');
  const destinationDirectory = platform.join(tmpPath, 'compressGz');
  await runNodeWithEnvOrThrow(
    Effect.gen(function* () {
      yield* emptyDir(destinationDirectory);
      yield* copyFolder(sourceDirectory, destinationDirectory);
      compressDirectory = destinationDirectory;
      extractDirectory = platform.join(destinationDirectory, 'extract');
      yield* emptyDir(extractDirectory);
    }),
  );
});

test('GZ Creation Test', async () => {
  //const extractDirectory = platform.join(compressDirectory,'extracted');
  const sourceDirectory = platform.join(compressDirectory, 'source');
  const gzFilename = platform.join(compressDirectory, 'test_gz_create.gz');
  const targetSourceFilename = platform.join(sourceDirectory, 'README.md');

  await runNodeWithEnvOrThrow(
    fileStream(targetSourceFilename).pipe(
      gzip(),
      writeStreamToFile(gzFilename),
    ),
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
  const extractedFilename = platform.join(extractDirectory, 'README.md');
  await runNodeWithEnvOrThrow(
    fileStream(gzFilename).pipe(gunzip(), writeStreamToFile(extractedFilename)),
  );

  isSame = await compareFiles(
    extractedFilename,
    platform.join(sourceDirectory, 'README.md'),
  );
  expect(isSame).toBeTruthy();
});
