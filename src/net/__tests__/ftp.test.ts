import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Ftp } from '../ftp';
import { RemoteConnection } from '../remoteConnection';
import { FileTransportInfo } from '../../fileModel';
import { platform } from '../../platform';

let instanceState: { closed: boolean };

const accessMock = vi.fn(async () => {
  instanceState.closed = false;
});
const downloadToMock = vi.fn(async () => {});
const downloadToDirMock = vi.fn(async () => {
  return;
});
const uploadFromMock = vi.fn(async () => {
  return;
});
const uploadFromDirMock = vi.fn(async () => {
  return;
});
const sizeMock = vi.fn(async () => 123);
const lastModMock = vi.fn(async () => new Date('2020-01-02T03:04:05Z'));
const listMock = vi.fn(async () => [{ name: 'a.txt' }, { name: 'b' }]);
const closeMock = vi.fn(() => {
  instanceState.closed = true;
});

vi.mock('basic-ftp', () => {
  class Client {
    closed: boolean;
    ftp: any;
    constructor() {
      instanceState = { closed: true };
      this.closed = instanceState.closed;
      this.ftp = {};
    }
    access = async () => {
      await accessMock();
      this.closed = instanceState.closed;
    };
    downloadTo = downloadToMock;
    downloadToDir = downloadToDirMock;
    uploadFrom = uploadFromMock;
    uploadFromDir = uploadFromDirMock;
    size = sizeMock;
    lastMod = lastModMock;
    list = listMock;
    close = () => {
      closeMock();
      this.closed = instanceState.closed;
    };
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
  instanceState = { closed: true };
});

const makeConn = (): RemoteConnection => {
  const rc = new RemoteConnection();
  rc.serverURL = 'ftp.example.com';
  rc.userId = 'user';
  rc.password = 'pass';
  rc.port = 21;
  return rc;
};

describe('Ftp', () => {
  it('connected getter reflects !client.closed', () => {
    const ftp = new Ftp(makeConn());
    expect(ftp.connected).toBe(false); // closed=true -> !closed=false
    // simulate connection by flipping client.closed via any
    (ftp.client as any).closed = false;
    expect(ftp.connected).toBe(true);
  });

  it('download (file) initializes once and normalizes source path', async () => {
    const ftp = new Ftp(makeConn());
    const t = new FileTransportInfo({
      sourceFolderName: `in${platform.sep}dir`,
      sourceFilename: 'file.txt',
      destinationFolderName: `out${platform.sep}dir`,
      destinationFileName: 'dest.txt',
    });
    const r1 = await ftp.download(t);
    expect(r1.isOk()).toBe(true);
    expect(accessMock).toHaveBeenCalledTimes(1);
    expect(downloadToMock).toHaveBeenCalledTimes(1);
    const call = downloadToMock.mock.calls[0] as unknown as any[];
    const dest = call[0] as string;
    const src = call[1] as string;
    expect(dest.endsWith(`out${platform.sep}dir${platform.sep}dest.txt`)).toBe(
      true,
    );
    expect(src.replace(/\\/g, '/')).toContain('in/dir/file.txt');

    // second call should not re-init
    const r2 = await ftp.download(t);
    expect(r2.isOk()).toBe(true);
    expect(accessMock).toHaveBeenCalledTimes(1);
    expect(downloadToMock).toHaveBeenCalledTimes(2);
  });

  it('download (directory) calls downloadToDir with normalized source dir', async () => {
    const ftp = new Ftp(makeConn());
    const t = new FileTransportInfo({
      sourceFolderName: `in${platform.sep}dir`,
      destinationFolderName: `out${platform.sep}dir`,
    });
    const r = await ftp.download(t);
    expect(r.isOk()).toBe(true);
    expect(downloadToDirMock).toHaveBeenCalledTimes(1);
    const call2 = downloadToDirMock.mock.calls[0] as unknown as any[];
    const destDir = call2[0] as string;
    const srcDir = call2[1] as string;
    expect(destDir.endsWith(`out${platform.sep}dir`)).toBe(true);
    expect(srcDir).toBe('in/dir');
  });

  it('upload (directory per current code path) calls uploadFrom', async () => {
    const ftp = new Ftp(makeConn());
    const t = new FileTransportInfo({
      sourceFolderName: `in${platform.sep}dir`,
      destinationFolderName: `out${platform.sep}dir`,
    });
    const r = await ftp.upload(t);
    expect(r.isOk()).toBe(true);
    expect(uploadFromMock).toHaveBeenCalledTimes(1);
    const call3 = uploadFromMock.mock.calls[0] as unknown as any[];
    const src = call3[0] as string;
    const dest = call3[1] as string;
    expect(src.endsWith(`in${platform.sep}dir`)).toBe(true);
    expect(dest).toBe('out/dir');
  });

  it('upload (file per current code path) calls uploadFromDir', async () => {
    const ftp = new Ftp(makeConn());
    const t = new FileTransportInfo({
      sourceFolderName: `in${platform.sep}dir`,
      sourceFilename: 'file.txt',
      destinationFolderName: `out${platform.sep}dir`,
      destinationFileName: 'dest.txt',
    });
    const r = await ftp.upload(t);
    expect(r.isOk()).toBe(true);
    expect(uploadFromDirMock).toHaveBeenCalledTimes(1);
    const call4 = uploadFromDirMock.mock.calls[0] as unknown as any[];
    const srcDir = call4[0] as string;
    const destDir = call4[1] as string;
    expect(srcDir.replace(/\\/g, '/')).toBe('in/dir/file.txt');
    expect((destDir as string).replace(/\\/g, '/')).toBe('out/dir/dest.txt');
  });

  it('getFileInfo returns size and date with normalized path', async () => {
    const ftp = new Ftp(makeConn());
    const t = new FileTransportInfo({
      sourceFolderName: `in${platform.sep}dir`,
      sourceFilename: 'file.txt',
    });
    const r = await ftp.getFileInfo(t);
    expect(r.isOk()).toBe(true);
    if (r.isOk()) {
      expect(r.value.size).toBe(123);
      expect(r.value.date.toISOString()).toBe('2020-01-02T03:04:05.000Z');
    }
    expect(sizeMock).toHaveBeenCalledTimes(1);
    const call5 = sizeMock.mock.calls[0] as unknown as any[];
    const pathArg = (call5[0] as string).replace(/\\/g, '/');
    expect(pathArg).toBe('in/dir/file.txt');
  });

  it('listFiles returns only names', async () => {
    const ftp = new Ftp(makeConn());
    const t = new FileTransportInfo({
      sourceFolderName: `in${platform.sep}dir`,
    });
    const r = await ftp.listFiles(t);
    expect(r.isOk()).toBe(true);
    if (r.isOk()) {
      expect(r.value).toEqual(['a.txt', 'b']);
    }
  });

  it('init error is wrapped with NetworkError message', async () => {
    accessMock.mockImplementationOnce(async () => {
      throw new Error('cannot connect');
    });
    const ftp = new Ftp(makeConn());
    const t = new FileTransportInfo({ sourceFolderName: 'in' });
    const r = await ftp.download(t);
    expect(r.isErr()).toBe(true);
    if (r.isErr()) {
      expect(r.error.message).toBe('Fail to do ftp connection');
    }
  });

  it('close toggles to closed and returns ok; no-op when already closed', async () => {
    const ftp = new Ftp(makeConn());
    // when closed already
    let r = await ftp.close();
    expect(r.isOk()).toBe(true);
    expect(closeMock).toHaveBeenCalledTimes(0);
    // open then close
    await ftp.download(new FileTransportInfo({ sourceFolderName: 'in' }));
    r = await ftp.close();
    expect(r.isOk()).toBe(true);
    expect(closeMock).toHaveBeenCalledTimes(1);
  });
});
