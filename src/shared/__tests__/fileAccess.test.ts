import { expect, test } from 'vitest';
import { fsConstants, platform } from '../../infrastructure/fs/index.js';
import { Effect, Layer } from 'effect';
import { MainLayer, PlatformLayer } from '../../infrastructure/layer.js';
import { makeRunner } from '../../infrastructure/runtime.js';
import { FileAccessService } from '../fs/FileAccessService.js';

const nodeTestLayer = Layer.mergeAll(PlatformLayer, MainLayer);
const runNodeWithEnvOrThrow = makeRunner(nodeTestLayer);

const program = (fileName: string, timeoutSeconds: number) => {
  return Effect.gen(function* () {
    const service = yield* FileAccessService;
    return yield* service.waitTillExclusiveAccess(fileName, timeoutSeconds);
  });
};

test('File Exclusive Access Test', async () => {
  //const sourceDirectory = platform.resolve('./tests');
  let targetFilename = platform.tmpNameSync();

  let fileHandle = platform.openSync(
    targetFilename,
    'w',
    fsConstants.O_RDWR | fsConstants.O_EXCL,
  );

  let currentDate = new Date().getTime();
  let targetDate = currentDate + 1000;

  let timerId = setInterval(() => {
    platform.writeSync(fileHandle, 'a');
    if (targetDate < new Date().getTime()) {
      clearInterval(timerId);
      platform.closeSync(fileHandle);
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
  targetFilename = platform.tmpNameSync();

  fileHandle = platform.openSync(
    targetFilename,
    'w',
    fsConstants.O_RDWR | fsConstants.O_EXCL,
  );

  currentDate = new Date().getTime();
  targetDate = currentDate + 2000;
  platform.writeSync(fileHandle, 'a');
  timerId = setInterval(() => {
    platform.writeSync(fileHandle, 'a');
    if (targetDate < new Date().getTime()) {
      clearInterval(timerId);
      platform.closeSync(fileHandle);
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
