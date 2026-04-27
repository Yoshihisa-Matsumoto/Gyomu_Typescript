import { describe, it, expect, vi } from 'vitest';
import { platform } from '../fs/index.js'; // パス調整
import path from 'path';

describe('getExtension', () => {
  it('拡張子あり（.txt → txt）', () => {
    expect(platform.getExtension('file.txt')).toBe('txt');
  });

  it('複数ドット（.tar.gz → gz）', () => {
    expect(platform.getExtension('archive.tar.gz')).toBe('gz');
  });

  it('拡張子なし', () => {
    expect(platform.getExtension('file')).toBe('');
  });

  it('隠しファイル（.env）', () => {
    expect(platform.getExtension('.env')).toBe('');
  });

  it('パス付き', () => {
    expect(platform.getExtension('/path/to/file.log')).toBe('log');
  });
});
