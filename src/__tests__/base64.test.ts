import { base64String2String, string2Base64String } from '../base64';
import iconv from 'iconv-lite';
import { isArrayBufferView } from 'util/types';
import { expect, test } from 'vitest';
import { platform } from '../platform';

const cases: Array<{ filename: string; encoding: string }> = [];

test('base64 encode', () => {
  let strData = '';
  const bin = platform.readFileSync('tests/shiftjis_sample.txt');
  const utf8 = iconv.decode(bin, 'shiftjis');
  const encoded = string2Base64String(utf8);

  expect(utf8).toEqual(base64String2String(encoded));
});
