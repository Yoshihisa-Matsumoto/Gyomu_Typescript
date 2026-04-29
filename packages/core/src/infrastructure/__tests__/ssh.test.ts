import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Effect, Layer, Redacted, Result, Option } from 'effect';
import { SshService } from '../ssh/SshService.js';
import { ConfigService } from '../config.js';
import { makeRunner, makeRunnerAsReturn } from '../runtime.js';
import { NetworkError, ConfigError } from '../../errors.js';
import { NodeFileSystem } from '@effect/platform-node';

import { SourceError } from 'effect/ConfigProvider';
import EventEmitter from 'node:events';
import { MainLayer, PlatformLayer } from '../layer.js';
import { initLoggerFromEnv } from '../logger/logger.js';

await initLoggerFromEnv();
const nodeTestLayer = Layer.mergeAll(PlatformLayer, MainLayer);
const runNodeWithEnvOrThrow = makeRunner(nodeTestLayer);

const runNodeWithEnv = makeRunnerAsReturn(nodeTestLayer);
// Mock basic-ftp

const exec = vi.fn((command, cb) => {
  const stream = new EventEmitter() as any;
  stream.stderr = new EventEmitter();

  queueMicrotask(() => {
    cb(null, stream);

    stream.emit('data', Buffer.from('hello'));
    stream.stderr.emit('data', Buffer.from('warn'));
    stream.emit('exit', 0);
    stream.emit('close', 0);
  });
});

vi.mock('ssh2', async () => {
  const { EventEmitter } = await import('node:events');

  // class MockSSH {
  //   exec = exec;
  //   shell = exec;
  // }

  class MockClient extends EventEmitter {
    __ssh: any;

    constructor() {
      super();
      //this.__ssh = new MockSSH();
    }

    connect = vi.fn(() => {
      queueMicrotask(() => {
        this.emit('ready');
      });
    });

    end = vi.fn();

    // sftp = vi.fn((cb) => {
    //   queueMicrotask(() => {
    //     cb(null, this.__ssh);
    //   });
    // });
    exec = exec;
    shell = exec;
  }

  return {
    Client: MockClient,
  };
});
beforeEach(() => {
  exec.mockClear();
});

describe('SshService', () => {
  const mockConfigService = Layer.succeed(ConfigService, {
    load: vi.fn().mockReturnValue(
      Effect.succeed({
        host: 'mock.sftp.com',
        port: 22,
        user: 'testuser',
        password: Option.some(Redacted.make('testpass')),
        privateKeyFilename: 'abcd.extlse',
      }),
    ),
  });

  const usingLayer = Layer.provideMerge(
    SshService.live,
    mockConfigService,
  ).pipe(Layer.provide(NodeFileSystem.layer));

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('withConnection - basic functionality', () => {
    it('should establish FTP connection and execute function', async () => {
      const program = Effect.gen(function* () {
        const ssh = yield* SshService;
        return yield* ssh.withConnection('', () => Effect.succeed('connected'));
      });

      const result = await runNodeWithEnvOrThrow(program, usingLayer);

      expect(result).toBe('connected');
    });

    it('should close connection even if function throws', async () => {
      const program = Effect.gen(function* () {
        const ssh = yield* SshService;
        return yield* ssh.withConnection('', () =>
          Effect.fail(
            new NetworkError({
              message: 'Test error',
              cause: undefined,
              operation: 'connect',
              retryable: false,
            }),
          ),
        );
      });

      await expect(
        runNodeWithEnvOrThrow(program, usingLayer),
      ).rejects.toThrow();
    });
  });

  describe('exec functionality', () => {
    it('should exec ', async () => {
      const program = Effect.gen(function* () {
        const ssh = yield* SshService;
        return yield* ssh.withConnection('', (client) =>
          client.execute('test.exe', {}),
        );
      });

      const result = await runNodeWithEnvOrThrow(program, usingLayer);

      expect(result).toEqual({
        exitCode: 0,
        result: 'hello',
        error: 'warn',
      });
    });

    it('should handle exec errors', async () => {
      exec.mockImplementation((cmd, cb) => {
        cb(new Error('exec failed'), null);
      });
      //readdir.mockRejectedValue(new Error('List failed'));

      const program = Effect.gen(function* () {
        const ssh = yield* SshService;
        return yield* ssh.withConnection('', (client) =>
          client.execute('test.exe', {}),
        );
      });

      await expect(runNodeWithEnvOrThrow(program, usingLayer)).rejects.toThrow(
        NetworkError,
      );
    });
  });

  describe('error handling', () => {
    // it('should handle connection errors', async () => {
    //   accessMock.mockRejectedValue(new Error('Connection failed'));

    //   const program = Effect.gen(function* () {
    //     const ssh = yield* SshService;
    //     return yield* ssh.withConnection('', () => Effect.succeed(undefined));
    //   });

    //   const result = await runNodeWithEnv(program, usingLayer);

    //   expect(Result.isFailure(result)).toBe(true);
    // });

    it('should handle config errors', async () => {
      const failingConfigService = Layer.succeed(ConfigService, {
        load: () =>
          Effect.fail(
            new ConfigError({
              cause: 'mock error',
              message: 'Config load failed',
              phase: 'load' as const,
            }),
          ),
      });

      const program = Effect.gen(function* () {
        const ssh = yield* SshService;
        return yield* ssh.withConnection('', () => Effect.succeed(undefined));
      });

      const failureLayer = Layer.provideMerge(
        SshService.live,
        failingConfigService,
      ).pipe(Layer.provide(NodeFileSystem.layer));

      const result = await runNodeWithEnv(program, failureLayer);

      expect(Result.isFailure(result)).toBe(true);
    });
  });
});
