import {
  base64String2String,
  string2Base64String,
} from '../shared/encoding/base64.js';
import { expect, test } from 'vitest';
import { platform } from '../platform/index.js';
import { decode } from '../shared/encoding/decode.js';

test('base64 encode', () => {
  const bin = platform.readFileSync('tests/shiftjis_sample.txt');
  const utf8 = decode(bin, 'shift-jis');
  const encoded = string2Base64String(utf8);

  expect(utf8).toEqual(base64String2String(encoded));
});
