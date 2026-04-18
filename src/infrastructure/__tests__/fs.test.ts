import { describe, it, expect, vi } from 'vitest';
import { fs } from '../fs/index.js'; // パス調整
import path from 'path';

describe('getExtension', () => {
  it('拡張子あり（.txt → txt）', () => {
    expect(fs.getExtension('file.txt')).toBe('txt');
  });

  it('複数ドット（.tar.gz → gz）', () => {
    expect(fs.getExtension('archive.tar.gz')).toBe('gz');
  });

  it('拡張子なし', () => {
    expect(fs.getExtension('file')).toBe('');
  });

  it('隠しファイル（.env）', () => {
    expect(fs.getExtension('.env')).toBe('');
  });

  it('パス付き', () => {
    expect(fs.getExtension('/path/to/file.log')).toBe('log');
  });
});

describe('createDirectoryFromFileNameIfNotExist', () => {
  it('ディレクトリが存在しない場合 → 作成される', () => {
    const existsMock = vi.spyOn(fs, 'existsSync').mockReturnValue(false);
    const ensureMock = vi
      .spyOn(fs, 'ensureDirSync')
      .mockImplementation(() => {});

    fs.createDirectoryFromFileNameIfNotExist('/tmp/test/file.txt');

    expect(existsMock).toHaveBeenCalledWith(path.dirname('/tmp/test/file.txt'));
    expect(ensureMock).toHaveBeenCalledWith(path.dirname('/tmp/test/file.txt'));
  });

  it('ディレクトリが存在する場合 → 何もしない', () => {
    const existsMock = vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    const ensureMock = vi
      .spyOn(fs, 'ensureDirSync')
      .mockImplementation(() => {});

    fs.createDirectoryFromFileNameIfNotExist('/tmp/test/file.txt');

    expect(existsMock).toHaveBeenCalled();
    expect(ensureMock).not.toHaveBeenCalled();
  });
});
