import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Effect, Layer, Redacted, Result, Stream } from 'effect';
import { FtpService } from '../ftp/ftpLayer.js';
import { ConfigService } from '../config.js';
import { makeRunner, makeRunnerAsReturn } from '../runtime.js';
import { NetworkError } from '../../errors.js';
import { FileTransportInfo } from '../../gyomu/file/transport.js';
import { NodeFileSystem } from '@effect/platform-node';
import { Readable } from 'node:stream';
import { ConfigError } from 'effect/Config';
import { SourceError } from 'effect/ConfigProvider';
import { MainLayer, PlatformLayer } from '../layer.js';

const nodeTestLayer = Layer.mergeAll(PlatformLayer, MainLayer);
const runNodeWithEnvOrThrow = makeRunner(nodeTestLayer);

const runNodeWithEnv = makeRunnerAsReturn(nodeTestLayer);
// Mock basic-ftp

const accessMock = vi.fn(async () => {});
const downloadToMock = vi.fn<(dest: any) => Promise<void>>(async () => {});
const downloadToDirMock = vi.fn(async () => {
  return;
});
const uploadFromMock = vi.fn<() => Promise<any>>(async () => {
  return;
});
const uploadFromDirMock = vi.fn(async () => {
  return;
});
const sizeMock = vi.fn(async () => 123);
const lastModMock = vi.fn(async () => new Date('2020-01-02T03:04:05Z'));
const listMock = vi.fn(async () => [{ name: 'a.txt' }, { name: 'b' }]);
const closeMock = vi.fn(() => {});

vi.mock('basic-ftp', () => {
  class Client {
    closed: boolean;
    ftp: any;
    private state: { closed: boolean };

    constructor() {
      this.state = { closed: true };
      this.closed = this.state.closed;
      this.ftp = {};
      console.log('Mock FTP Client: instantiated');
    }

    access = async () => {
      await accessMock();
      this.state.closed = false;
      this.closed = this.state.closed;
      console.log('Mock FTP Client: access called, connection opened');
    };

    close = () => {
      closeMock();
      this.state.closed = true;
      this.closed = this.state.closed;
    };

    downloadTo = downloadToMock;
    downloadToDir = downloadToDirMock;
    uploadFrom = uploadFromMock;
    uploadFromDir = uploadFromDirMock;
    size = sizeMock;
    lastMod = lastModMock;
    list = listMock;
  }

  return { Client };
});

beforeEach(() => {
  accessMock.mockClear();
  downloadToMock.mockClear();
  downloadToDirMock.mockClear();
  uploadFromMock.mockClear();
  uploadFromDirMock.mockClear();
  sizeMock.mockClear();
  lastModMock.mockClear();
  listMock.mockClear();
  closeMock.mockClear();
});

describe('FtpService', () => {
  const mockConfigService = Layer.succeed(ConfigService, {
    load: vi.fn().mockReturnValue(
      Effect.succeed({
        host: 'mock.ftp.com',
        port: 21,
        user: 'testuser',
        password: Redacted.make('testpass'),
        secure: false,
      }),
    ),
  });

  const usingLayer = Layer.provideMerge(
    FtpService.live,
    mockConfigService,
  ).pipe(Layer.provide(NodeFileSystem.layer));

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('withConnection - basic functionality', () => {
    it('should establish FTP connection and execute function', async () => {
      const program = Effect.gen(function* () {
        const ftp = yield* FtpService;
        return yield* ftp.withConnection('', () => Effect.succeed('connected'));
      });

      const result = await runNodeWithEnvOrThrow(program, usingLayer);

      expect(result).toBe('connected');
    });

    it('should close connection even if function throws', async () => {
      const program = Effect.gen(function* () {
        const ftp = yield* FtpService;
        return yield* ftp.withConnection('', () =>
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
        const ftp = yield* FtpService;
        return yield* ftp.withConnection('', (client) => client.list('/test'));
      });

      const result = await runNodeWithEnvOrThrow(program, usingLayer);

      expect(result).toEqual(['a.txt', 'b']);
    });

    it('should handle list errors', async () => {
      listMock.mockRejectedValue(new Error('List failed'));

      const program = Effect.gen(function* () {
        const ftp = yield* FtpService;
        return yield* ftp.withConnection('', (client) => client.list('/test'));
      });

      await expect(runNodeWithEnvOrThrow(program, usingLayer)).rejects.toThrow(
        NetworkError,
      );
    });
  });

  describe('getFileInfo functionality', () => {
    it('should get file info', async () => {
      const program = Effect.gen(function* () {
        const ftp = yield* FtpService;
        return yield* ftp.withConnection('', (client) =>
          client.getFileInfo('/test/file.txt'),
        );
      });

      const result = await runNodeWithEnvOrThrow(program, usingLayer);

      expect(result).toEqual({
        size: 123,
        date: new Date('2020-01-02T03:04:05Z'),
      });
      expect(sizeMock).toHaveBeenCalledWith('/test/file.txt');
      expect(lastModMock).toHaveBeenCalledWith('/test/file.txt');
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

      const program = Effect.gen(function* () {
        const ftp = yield* FtpService;
        return yield* ftp.withConnection('', (client) =>
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

      const program = Effect.gen(function* () {
        const ftp = yield* FtpService;
        return yield* ftp.withConnection('', (client) =>
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
        const ftp = yield* FtpService;
        return yield* ftp.withConnection('', (client) =>
          client.upload(transportInfo),
        );
      });

      const result = await runNodeWithEnvOrThrow(program, usingLayer);

      expect(result).toBe(true);
    });
  });

  describe('downloadToStream functionality', () => {
    it('should download to stream', async () => {
      const mockReadable = Readable.from(['hello', 'world']);
      downloadToMock.mockImplementation(async (dest) => {
        mockReadable.pipe(dest);
      });

      const program = Effect.gen(function* () {
        const ftp = yield* FtpService;
        return yield* ftp.withConnection('', (client) =>
          Stream.runCollect(client.downloadToStream('/test/file.txt')),
        );
      });

      const result = await runNodeWithEnvOrThrow(program, usingLayer);

      expect(result).toBeDefined();
      expect(downloadToMock).toHaveBeenCalled();
    });
  });

  describe('uploadFromStream functionality', () => {
    it('should upload from stream', async () => {
      const mockStream = Stream.fromIterable([new Uint8Array([1, 2, 3])]);

      const program = Effect.gen(function* () {
        const ftp = yield* FtpService;
        return yield* ftp.withConnection('', (client) =>
          client.uploadFromStream(mockStream, '/remote/file.txt'),
        );
      });

      await runNodeWithEnvOrThrow(program, usingLayer);

      expect(uploadFromMock).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle connection errors', async () => {
      accessMock.mockRejectedValue(new Error('Connection failed'));

      const program = Effect.gen(function* () {
        const ftp = yield* FtpService;
        return yield* ftp.withConnection('', () => Effect.succeed(undefined));
      });

      const result = await runNodeWithEnv(program, usingLayer);

      expect(Result.isFailure(result)).toBe(true);
    });

    it('should handle config errors', async () => {
      const failingConfigService = Layer.succeed(ConfigService, {
        load: () =>
          Effect.fail(
            new ConfigError(new SourceError(new Error('Config load failed'))),
          ),
      });

      const program = Effect.gen(function* () {
        const ftp = yield* FtpService;
        return yield* ftp.withConnection('', () => Effect.succeed(undefined));
      });

      const failureLayer = Layer.provideMerge(
        FtpService.live,
        failingConfigService,
      ).pipe(Layer.provide(NodeFileSystem.layer));

      const result = await runNodeWithEnv(program, failureLayer);

      expect(Result.isFailure(result)).toBe(true);
    });
  });
});
