import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { FileTransportInfo } from '../../fileModel.js';
import { Scp } from '../scp.js';
import { platform } from '../../platform/index.js';

// Mock node-scp client
const mockClient = {
  downloadDir: vi.fn(async () => {}),
  downloadFile: vi.fn(async () => {}),
  uploadDir: vi.fn(async () => {}),
  uploadFile: vi.fn(async () => {}),
  close: vi.fn(async () => {}),
};

vi.mock('node-scp', () => ({
  Client: vi.fn(async () => mockClient),
}));

// Stub minimal platform I/O used by stream helpers
beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(platform, 'writeFile').mockResolvedValue();
  vi.spyOn(platform, 'readFile').mockResolvedValue(Buffer.from('data'));
  vi.spyOn(platform, 'remove').mockResolvedValue();
  vi.spyOn(platform, 'tmpdir').mockReturnValue('C:/tmp');
  vi.spyOn(platform, 'join').mockImplementation(
    (a: string, b: string) => `${a}/${b}`,
  );
  vi.spyOn(platform, 'createWriteStream').mockReturnValue({
    // minimal writable mock with pipe target
  } as any);
  vi.spyOn(platform, 'createReadStream').mockReturnValue({
    // minimal readable mock
  } as any);
});

const conn = {
  serverURL: 'host',
  userId: 'user',
  password: 'pass',
  port: 22,
} as any;

describe('Scp', () => {
  it('downloads a directory', async () => {
    const scp = new Scp(conn);
    const info = {
      isSourceDirectory: true,
      sourceFolderName: 'remote/dir',
      destinationPath: 'C:/local/dir',
    } as unknown as FileTransportInfo;
    const res = await scp.download(info);
    expect(res.isOk()).toBe(true);
    expect(mockClient.downloadDir).toHaveBeenCalledWith(
      'remote/dir',
      'C:/local/dir',
    );
  });

  it('downloads a file with path normalization', async () => {
    const scp = new Scp(conn);
    const info = {
      isSourceDirectory: false,
      sourceFullName: 'remote\\file.txt',
      destinationFullName: 'C:/local/file.txt',
    } as unknown as FileTransportInfo;
    const res = await scp.download(info);
    expect(res.isOk()).toBe(true);
    expect(mockClient.downloadFile).toHaveBeenCalledWith(
      'remote/file.txt',
      'C:/local/file.txt',
    );
  });

  it('uploads a directory', async () => {
    const scp = new Scp(conn);
    const info = {
      isSourceDirectory: true,
      sourceFullName: 'C:/local/dir',
      destinationFullName: 'remote/dir',
    } as unknown as FileTransportInfo;
    const res = await scp.upload(info);
    expect(res.isOk()).toBe(true);
    expect(mockClient.uploadDir).toHaveBeenCalledWith(
      'C:/local/dir',
      'remote/dir',
    );
  });

  it('uploads a file with path normalization', async () => {
    const scp = new Scp(conn);
    const info = {
      isSourceDirectory: false,
      sourceFullName: 'C:/local/file.txt',
      destinationFullName: 'remote\\file.txt',
    } as unknown as FileTransportInfo;
    const res = await scp.upload(info);
    expect(res.isOk()).toBe(true);
    expect(mockClient.uploadFile).toHaveBeenCalledWith(
      'C:/local/file.txt',
      'remote/file.txt',
    );
  });

  it('uploadStream with Buffer writes temp and uploads', async () => {
    const scp = new Scp(conn);
    const buffer = Buffer.from('hello');
    const res = await scp.uploadStream(buffer, 'remote/path.txt');
    expect(res.isOk()).toBe(true);
    expect(platform.writeFile).toHaveBeenCalled();
    expect(mockClient.uploadFile).toHaveBeenCalled();
    expect(platform.remove).toHaveBeenCalled();
  });

  it('downloadToBuffer returns data', async () => {
    const scp = new Scp(conn);
    const res = await scp.downloadToBuffer('remote/file.txt');
    expect(res.isOk()).toBe(true);
    const buf = res._unsafeUnwrap();
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(mockClient.downloadFile).toHaveBeenCalledWith(
      'remote/file.txt',
      expect.stringContaining('/scp_tmp_'),
    );
  });

  it('downloadToStream returns a readable', async () => {
    const scp = new Scp(conn);
    const res = await scp.downloadToStream('remote/file.txt');
    expect(res.isOk()).toBe(true);
    const stream = res._unsafeUnwrap();
    expect(stream).toBeDefined();
    expect(mockClient.downloadFile).toHaveBeenCalledWith(
      'remote/file.txt',
      expect.stringContaining('/scp_tmp_'),
    );
  });

  it('close calls client.close when connected', async () => {
    const scp = new Scp(conn);
    // ensure connection established
    await scp.upload({
      isSourceDirectory: false,
      sourceFullName: 'C:/local/file.txt',
      destinationFullName: 'remote/file.txt',
    } as unknown as FileTransportInfo);
    const res = await scp.close();
    expect(res.isOk()).toBe(true);
    expect(mockClient.close).toHaveBeenCalled();
  });
});
