import { describe, it, expect, vi } from 'vitest';

import { getFileExtension } from '../fs-utils.js';

describe('getExtension', () => {
  it('拡張子あり（.txt → txt）', () => {
    expect(getFileExtension('file.txt')).toBe('txt');
  });

  it('複数ドット（.tar.gz → gz）', () => {
    expect(getFileExtension('archive.tar.gz')).toBe('gz');
  });

  it('拡張子なし', () => {
    expect(getFileExtension('file')).toBe('');
  });

  it('隠しファイル（.env）', () => {
    expect(getFileExtension('.env')).toBe('');
  });

  it('パス付き', () => {
    expect(getFileExtension('/path/to/file.log')).toBe('log');
  });
});
