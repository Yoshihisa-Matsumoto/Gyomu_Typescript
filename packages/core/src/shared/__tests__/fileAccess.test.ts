import { expect, test } from 'vitest';
import fs from 'fs';
import { fsConstants } from '../../infrastructure/fs/index.js';
import path from 'path';
import { Effect, Layer } from 'effect';
import { MainLayer, PlatformLayer } from '../../infrastructure/layer.js';
import { makeRunner } from '../../infrastructure/runtime.js';
import { FileAccessService } from '../fs/FileAccessService.js';
import { initLoggerFromEnv } from '../../infrastructure/logger/logger.js';
import { getTempFilename } from '../../infrastructure/fs/fs-utils.js';

await initLoggerFromEnv();
const nodeTestLayer = Layer.mergeAll(PlatformLayer, MainLayer);
const runNodeWithEnvOrThrow = makeRunner(nodeTestLayer);

const program = (fileName: string, timeoutSeconds: number) => {
  return Effect.gen(function* () {
    const service = yield* FileAccessService;
    return yield* service.waitTillExclusiveAccess(fileName, timeoutSeconds);
  });
};

test('File Exclusive Access Test', async () => {
  //const sourceDirectory = path.resolve('./tests');
  let targetFilename = getTempFilename();

  let fileHandle = fs.openSync(
    targetFilename,
    'w',
    fsConstants.O_RDWR | fsConstants.O_EXCL,
  );

  let currentDate = new Date().getTime();
  let targetDate = currentDate + 1000;

  let timerId = setInterval(() => {
    fs.writeSync(fileHandle, 'a');
    if (targetDate < new Date().getTime()) {
      clearInterval(timerId);
      fs.closeSync(fileHandle);
    }
  }, 100);

  let result = await runNodeWithEnvOrThrow(
    program(targetFilename, 2),
    FileAccessService.live,
  );
  const finishDate = new Date().getTime();
  expect(result).toBeTruthy();

  const duration = finishDate - currentDate;
  //expect(result.value).toBeTruthy();
  expect(duration).toBeGreaterThan(500);
  expect(duration).toBeLessThan(2200);
  console.log('duration', duration);
  //console.log('test2');
  targetFilename = getTempFilename();

  fileHandle = fs.openSync(
    targetFilename,
    'w',
    fsConstants.O_RDWR | fsConstants.O_EXCL,
  );

  currentDate = new Date().getTime();
  targetDate = currentDate + 2000;
  fs.writeSync(fileHandle, 'a');
  timerId = setInterval(() => {
    fs.writeSync(fileHandle, 'a');
    if (targetDate < new Date().getTime()) {
      clearInterval(timerId);
      fs.closeSync(fileHandle);
    }
    //console.log('written', new Date());
  }, 50);
  result = await runNodeWithEnvOrThrow(
    program(targetFilename, 1),
    FileAccessService.live,
  );
  clearInterval(timerId);
  expect(result).toBeFalsy();
}, 10000);
