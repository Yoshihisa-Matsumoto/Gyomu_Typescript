import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Sftp } from '../sftp';
import { RemoteConnection } from '../remoteConnection';
import { FileTransportInfo } from '../../fileModel';
import { platform } from '../../platform';

const connectMock = vi.fn(async () => {});
const endMock = vi.fn(async () => {});
const downloadDirMock = vi.fn(async () => {});
const getMock = vi.fn(async () => {});
const uploadDirMock = vi.fn(async () => {});
const putMock = vi.fn(async () => {});
const statMock = vi.fn(async () => ({
  size: 456,
  modifyTime: Date.parse('2021-02-03T04:05:06Z'),
}));
const listMock = vi.fn(async () => [{ name: 'x' }, { name: 'y.dat' }]);

vi.mock('ssh2-sftp-client', () => {
  class SftpClient {
    connect = connectMock;
    end = endMock;
    downloadDir = downloadDirMock;
    get = getMock;
    uploadDir = uploadDirMock;
    put = putMock;
    stat = statMock;
    list = listMock;
  }
  return { default: SftpClient };
});

beforeEach(() => {
  connectMock.mockClear();
  endMock.mockClear();
  downloadDirMock.mockClear();
  getMock.mockClear();
  uploadDirMock.mockClear();
  putMock.mockClear();
  statMock.mockClear();
  listMock.mockClear();
});

const makeConn = (): RemoteConnection => {
  const rc = new RemoteConnection();
  rc.serverURL = 'sftp.example.com';
  rc.userId = 'user';
  rc.password = 'pass';
  rc.port = 22;
  return rc;
};

describe('Sftp', () => {
  it('connects on first call and reuses connection', async () => {
    const sftp = new Sftp(makeConn());
    expect(sftp.connected).toBe(false);
    const t = new FileTransportInfo({ sourceFolderName: 'in' });
    const r1 = await sftp.listFiles(t);
    expect(r1.isOk()).toBe(true);
    expect(connectMock).toHaveBeenCalledTimes(1);
    const r2 = await sftp.listFiles(t);
    expect(r2.isOk()).toBe(true);
    expect(connectMock).toHaveBeenCalledTimes(1);
  });

  it('download file and dir normalize paths', async () => {
    const sftp = new Sftp(makeConn());
    const tf = new FileTransportInfo({
      sourceFolderName: `in${platform.sep}dir`,
      sourceFilename: 'a.txt',
      destinationFolderName: `out${platform.sep}dir`,
      destinationFileName: 'b.txt',
    });
    const rf = await sftp.download(tf);
    expect(rf.isOk()).toBe(true);
    expect(getMock).toHaveBeenCalledTimes(1);
    const fileCall = getMock.mock.calls[0] as unknown as any[];
    expect((fileCall[0] as string).replace(/\\/g, '/')).toBe('in/dir/a.txt');
    expect(
      fileCall[1].endsWith(`out${platform.sep}dir${platform.sep}b.txt`),
    ).toBe(true);

    const td = new FileTransportInfo({
      sourceFolderName: `in${platform.sep}dir`,
      destinationFolderName: `out${platform.sep}dir`,
    });
    const rd = await sftp.download(td);
    expect(rd.isOk()).toBe(true);
    expect(downloadDirMock).toHaveBeenCalledTimes(1);
    const dirCall = downloadDirMock.mock.calls[0] as unknown as any[];
    expect(dirCall[0]).toBe('in/dir');
    expect(dirCall[1].endsWith(`out${platform.sep}dir`)).toBe(true);
  });

  it('upload file and dir normalize paths', async () => {
    const sftp = new Sftp(makeConn());
    const td = new FileTransportInfo({
      sourceFolderName: `in${platform.sep}dir`,
      destinationFolderName: `out${platform.sep}dir`,
    });
    const rd = await sftp.upload(td);
    expect(rd.isOk()).toBe(true);
    expect(uploadDirMock).toHaveBeenCalledTimes(1);
    const dirCall = uploadDirMock.mock.calls[0] as unknown as any[];
    expect(dirCall[0].endsWith(`in${platform.sep}dir`)).toBe(true);
    expect(dirCall[1]).toBe('out/dir');

    const tf = new FileTransportInfo({
      sourceFolderName: `in${platform.sep}dir`,
      sourceFilename: 'a.txt',
      destinationFolderName: `out${platform.sep}dir`,
      destinationFileName: 'b.txt',
    });
    const rf = await sftp.upload(tf);
    expect(rf.isOk()).toBe(true);
    expect(putMock).toHaveBeenCalledTimes(1);
    const fileCall = putMock.mock.calls[0] as unknown as any[];
    expect(
      fileCall[0].endsWith(`in${platform.sep}dir${platform.sep}a.txt`),
    ).toBe(true);
    expect((fileCall[1] as string).replace(/\\/g, '/')).toBe('out/dir/b.txt');
  });

  it('getFileInfo and listFiles work with normalized paths', async () => {
    const sftp = new Sftp(makeConn());
    const t = new FileTransportInfo({
      sourceFolderName: `in${platform.sep}dir`,
      sourceFilename: 'a.txt',
    });
    const r = await sftp.getFileInfo(t);
    expect(r.isOk()).toBe(true);
    if (r.isOk()) {
      expect(r.value.size).toBe(456);
      expect(r.value.date.toISOString()).toBe('2021-02-03T04:05:06.000Z');
    }
    const call = statMock.mock.calls[0] as unknown as any[];
    expect((call[0] as string).replace(/\\/g, '/')).toBe('in/dir/a.txt');

    const l = await sftp.listFiles(
      new FileTransportInfo({ sourceFolderName: 'in' }),
    );
    expect(l.isOk()).toBe(true);
    if (l.isOk()) expect(l.value).toEqual(['x', 'y.dat']);
  });

  it('wraps connect and close errors with NetworkError messages', async () => {
    connectMock.mockImplementationOnce(async () => {
      throw new Error('no conn');
    });
    const sftp = new Sftp(makeConn());
    const r = await sftp.listFiles(
      new FileTransportInfo({ sourceFolderName: 'in' }),
    );
    expect(r.isErr()).toBe(true);
    if (r.isErr()) expect(r.error.message).toBe('Fail to do SFTP connection');

    // make it connected then make end() fail
    (connectMock as any).mockImplementationOnce(async () => {});
    const s2 = new Sftp(makeConn());
    await s2.listFiles(new FileTransportInfo({ sourceFolderName: 'in' }));
    endMock.mockImplementationOnce(async () => {
      throw new Error('cannot end');
    });
    const c = await s2.close();
    expect(c.isErr()).toBe(true);
    if (c.isErr())
      expect(c.error.message).toBe('Fail to close SFTP connection');
  });
});
