import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  initLoggerFromEnv,
  logger,
  __resetLoggerForTest,
} from '../logger/logger.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

beforeEach(() => {
  __resetLoggerForTest();
});

// テスト用.envパス
//const envPath = path.resolve(process.cwd(), '.env.testlog');
const logFilename = path.join(os.tmpdir(), 'test-log');
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
      LOGFILENAME: 'test-log',
    };
  });

  afterEach(async () => {
    //await logger.end();
    fs.rmSync(logFilename);
  });

  it('should initialize logger from env and write logs', async () => {
    await initLoggerFromEnv();

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

describe('Logger not initialized', () => {
  it('should throw error if used before initialization', () => {
    expect(() => {
      logger.info('should fail');
    }).toThrow(
      'Logger called WITHOUT initialized. Please call initLoggerFromEnv or initLogger ',
    );
  });
});
