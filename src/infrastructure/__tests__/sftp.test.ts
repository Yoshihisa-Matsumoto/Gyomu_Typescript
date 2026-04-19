import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Effect, Layer, Redacted, Result, Stream, Option } from 'effect';
import { SftpService } from '../sftp/SftpService.js';
import { ConfigService } from '../config.js';
import { makeRunner, makeRunnerAsReturn } from '../runtime.js';
import { NetworkError } from '../../errors.js';
import { FileTransportInfo } from '../../gyomu/file/transport.js';
import { NodeFileSystem } from '@effect/platform-node';
import { Readable, Writable } from 'node:stream';
import { ConfigError } from 'effect/Config';
import { SourceError } from 'effect/ConfigProvider';
import { MainLayer, PlatformLayer } from '../layer.js';

const nodeTestLayer = Layer.mergeAll(PlatformLayer, MainLayer);
const runNodeWithEnvOrThrow = makeRunner(nodeTestLayer);

const runNodeWithEnv = makeRunnerAsReturn(nodeTestLayer);
// Mock basic-ftp

const readdir = vi.fn((path, cb) => {
  cb(null, [
    { filename: 'a.txt', attrs: { isDirectory: () => false } },
    { filename: 'b', attrs: { isDirectory: () => false } },
  ]);
});
const stat = vi.fn((path, cb) => {
  cb(null, {
    size: 123,
    mtime: new Date('2020-01-02T03:04:05Z').getTime() / 1000,
    isFile: () => true,
  });
});
const fastGet = vi.fn((remote, local, cb) => {
  cb(null);
});
const fastPut = vi.fn((remote, local, cb) => {
  cb(null);
});
const mkdir = vi.fn((remote, local, cb) => {
  cb(null);
});
const createReadStream = vi.fn(() => {
  const rs = new Readable({
    read() {},
  });

  queueMicrotask(() => {
    rs.emit('open');

    // 🔥 データを流す
    rs.push(Buffer.from('hello'));

    // 🔥 これが最重要（EOF）
    rs.push(null);
  });

  return rs;
});

const createWriteStream = vi.fn(() => {
  const ws = new Writable({
    write(_chunk, _enc, cb) {
      cb();
    },
  });

  queueMicrotask(() => {
    ws.emit('open');
  });

  // 🔥 ここが重要
  ws.on('pipe', (src) => {
    src.on('end', () => {
      ws.emit('finish');
      ws.emit('close'); // 念のため
    });
  });

  return ws;
});

vi.mock('ssh2', async () => {
  const { EventEmitter } = await import('node:events');

  class MockSFTP {
    readdir = readdir;
    stat = stat;
    fastGet = fastGet;
    fastPut = fastPut;
    mkdir = mkdir;

    createReadStream = createReadStream;

    createWriteStream = createWriteStream;
  }

  class MockClient extends EventEmitter {
    __sftp: any;

    constructor() {
      super();
      this.__sftp = new MockSFTP();
    }

    connect = vi.fn(() => {
      queueMicrotask(() => {
        this.emit('ready');
      });
    });

    end = vi.fn();

    sftp = vi.fn((cb) => {
      queueMicrotask(() => {
        cb(null, this.__sftp);
      });
    });
  }

  return {
    Client: MockClient,
  };
});
beforeEach(() => {
  readdir.mockClear();
  stat.mockClear();
  fastGet.mockClear();
  fastPut.mockClear();
  mkdir.mockClear();
  createReadStream.mockClear();
  createWriteStream.mockClear();
});

describe('SftpService', () => {
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
    SftpService.live,
    mockConfigService,
  ).pipe(Layer.provide(NodeFileSystem.layer));

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('withConnection - basic functionality', () => {
    it('should establish FTP connection and execute function', async () => {
      const program = Effect.gen(function* () {
        const sftp = yield* SftpService;
        return yield* sftp.withConnection('', () =>
          Effect.succeed('connected'),
        );
      });

      const result = await runNodeWithEnvOrThrow(program, usingLayer);

      expect(result).toBe('connected');
    });

    it('should close connection even if function throws', async () => {
      const program = Effect.gen(function* () {
        const sftp = yield* SftpService;
        return yield* sftp.withConnection('', () =>
          Effect.fail(new NetworkError('Test error')),
        );
      });

      await expect(
        runNodeWithEnvOrThrow(program, usingLayer),
      ).rejects.toThrow();
    });
  });

  describe('list functionality', () => {
    it('should list files in directory', async () => {
      const program = Effect.gen(function* () {
        const sftp = yield* SftpService;
        return yield* sftp.withConnection('', (client) => client.list('/test'));
      });

      const result = await runNodeWithEnvOrThrow(program, usingLayer);

      expect(result).toEqual(['a.txt', 'b']);
    });

    it('should handle list errors', async () => {
      readdir.mockImplementationOnce((path, cb) => {
        queueMicrotask(() => {
          cb(new Error('List failed'), null);
        });
      });
      //readdir.mockRejectedValue(new Error('List failed'));

      const program = Effect.gen(function* () {
        const sftp = yield* SftpService;
        return yield* sftp.withConnection('', (client) => client.list('/test'));
      });

      await expect(runNodeWithEnvOrThrow(program, usingLayer)).rejects.toThrow(
        NetworkError,
      );
    });
  });

  describe('getFileInfo functionality', () => {
    it('should get file info', async () => {
      const program = Effect.gen(function* () {
        const sftp = yield* SftpService;
        return yield* sftp.withConnection('', (client) =>
          client.getFileInfo('/test/file.txt'),
        );
      });

      const result = await runNodeWithEnvOrThrow(program, usingLayer);

      expect(result).toEqual({
        size: 123,
        date: new Date('2020-01-02T03:04:05Z'),
        isFile: true,
      });
      //expect(stat).toHaveBeenCalledWith('/test/file.txt');
    });
  });

  describe('download functionality', () => {
    it('should download file', async () => {
      const transportInfo: FileTransportInfo = new FileTransportInfo({
        sourceFilename: 'file.txt',
        destinationFileName: 'file.txt',
        sourceFolderName: '/remote',
        destinationFolderName: '/local',
      });
      readdir.mockImplementationOnce((path, cb) => {
        cb(null, [{ filename: 'file.txt', isDirectory: () => false }]);
      });

      const program = Effect.gen(function* () {
        const sftp = yield* SftpService;
        return yield* sftp.withConnection('', (client) =>
          client.download(transportInfo),
        );
      });

      const result = await runNodeWithEnvOrThrow(program, usingLayer);

      expect(result).toBe(true);
    });

    it('should download directory', async () => {
      const transportInfo: FileTransportInfo = new FileTransportInfo({
        sourceFolderName: '/remote/dir',
        destinationFolderName: '/local/dir',
      });
      // readdir.mockImplementationOnce((path, cb) => {
      //   cb(null, [{ filename: 'dir', isDirectory: () => true }]);
      // });

      const program = Effect.gen(function* () {
        const sftp = yield* SftpService;
        return yield* sftp.withConnection('', (client) =>
          client.download(transportInfo),
        );
      });

      const result = await runNodeWithEnvOrThrow(program, usingLayer);

      expect(result).toBe(true);
    });
  });

  describe('upload functionality', () => {
    it('should upload file', async () => {
      const transportInfo: FileTransportInfo = new FileTransportInfo({
        sourceFilename: 'file.txt',
        destinationFileName: 'file.txt',
        sourceFolderName: '/local',
        destinationFolderName: '/remote',
      });

      const program = Effect.gen(function* () {
        const sftp = yield* SftpService;
        return yield* sftp.withConnection('', (client) =>
          client.upload(transportInfo),
        );
      });

      const result = await runNodeWithEnvOrThrow(program, usingLayer);

      expect(result).toBe(true);
    });
  });

  describe('downloadToStream functionality', () => {
    it('should download to stream', async () => {
      //const mockReadable = Readable.from(['hello', 'world']);
      // downloadToMock.mockImplementation(async (dest) => {
      //   mockReadable.pipe(dest);
      // });

      const program = Effect.gen(function* () {
        const sftp = yield* SftpService;
        return yield* sftp.withConnection('', (client) =>
          Stream.runCollect(client.downloadToStream('/test/file.txt')),
        );
      });

      const result = await runNodeWithEnvOrThrow(program, usingLayer);

      expect(result).toBeDefined();
      //expect(downloadToMock).toHaveBeenCalled();
    });
  });

  describe('uploadFromStream functionality', () => {
    it('should upload from stream', async () => {
      const mockStream = Stream.fromIterable([new Uint8Array([1, 2, 3])]);

      const program = Effect.gen(function* () {
        const sftp = yield* SftpService;
        return yield* sftp.withConnection('', (client) =>
          client.uploadFromStream(mockStream, '/remote/file.txt'),
        );
      });

      await runNodeWithEnvOrThrow(program, usingLayer);
    });
  });

  describe('error handling', () => {
    // it('should handle connection errors', async () => {
    //   accessMock.mockRejectedValue(new Error('Connection failed'));

    //   const program = Effect.gen(function* () {
    //     const sftp = yield* SftpService;
    //     return yield* sftp.withConnection('', () => Effect.succeed(undefined));
    //   });

    //   const result = await runNodeWithEnv(program, usingLayer);

    //   expect(Result.isFailure(result)).toBe(true);
    // });

    it('should handle config errors', async () => {
      const failingConfigService = Layer.succeed(ConfigService, {
        load: () =>
          Effect.fail(
            new ConfigError(new SourceError(new Error('Config load failed'))),
          ),
      });

      const program = Effect.gen(function* () {
        const sftp = yield* SftpService;
        return yield* sftp.withConnection('', () => Effect.succeed(undefined));
      });

      const failureLayer = Layer.provideMerge(
        SftpService.live,
        failingConfigService,
      ).pipe(Layer.provide(NodeFileSystem.layer));

      const result = await runNodeWithEnv(program, failureLayer);

      expect(Result.isFailure(result)).toBe(true);
    });
  });
});
