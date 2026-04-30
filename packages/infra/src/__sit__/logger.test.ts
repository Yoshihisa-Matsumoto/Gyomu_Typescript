process.env.LOGFILENAME = 'test-log.log';
console.log('env', process.env.LOGFILENAME);
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  initLoggerFromEnv,
  __resetLoggerForTest,
  initLogger,
} from '../logger/pinoLogger.js';
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { logger } from '@gyomu/core';

beforeEach(() => {
  __resetLoggerForTest();
});

// テスト用.envパス
//const envPath = path.resolve(process.cwd(), '.env.testlog');
const logFilename = path.join(tmpdir(), 'test-log.log');
describe('Logger integration test (.env)', () => {
  beforeEach(() => {
    // テスト用.envを書く
    //     fs.writeFileSync(
    //       envPath,
    //       `
    // LOGGER_LEVEL=debug
    // FIXED_LOGFILENAME=true
    // LOGPATH=./logs
    // LOGFILENAME=test-log
    // `.trim(),
    //     );

    process.env = {
      ...process.env,
      LOGGER_LEVEL: 'debug',
      FIXED_LOGFILENAME: 'true',
      LOGFILENAME: 'test-log.log',
      LOGPATH: tmpdir(),
    };
  });

  afterEach(async () => {
    //await logger.end();
    //if (fs.existsSync(logFilename)) fs.rmSync(logFilename);
  });

  it('should initialize logger from env and write logs', async () => {
    console.log('env', process.env.LOGFILENAME);
    //await initLoggerFromEnv();
    await initLogger({
      logFilename: 'test-log.log',
      logLevel: 'debug',
      fixedLogFilename: true,
      logPath: tmpdir(),
    });

    console.log(logger.isDebugEnabled());
    expect(() => {
      logger.info('test log');
      logger.debug('debug log');
    }).not.toThrow();
    await logger.end();

    // ファイル出力確認（あれば）
    const files = fs.existsSync(logFilename)
      ? fs.readFileSync(logFilename).toString()
      : undefined;

    expect(files).not.toBeUndefined();
    console.log('log', files);
  });
});

// describe('Logger not initialized', () => {
//   it('should throw error if used before initialization', () => {
//     expect(() => {
//       logger.info('should fail');
//     }).toThrow(
//       'Logger called WITHOUT initialized. Please call initLoggerFromEnv or initLogger ',
//     );
//   });
// });
