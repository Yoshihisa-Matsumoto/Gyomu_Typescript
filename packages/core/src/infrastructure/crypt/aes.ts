import crypto from 'crypto';
import {
  base64String2Buffer,
  buffer2Base64String,
} from '../../shared/encoding/base64.js';
import {
  arrayBufferToString,
  bufferToArrayBuffer,
  stringToArrayBuffer,
} from '../../shared/binary/convert.js';
import { Effect, FileSystem } from 'effect';
import { readFromFile } from '../fs/fs-utils.js';
import { IOError } from '../../errors.js';

export const aesEncrypt = (plain: string, key: string): string => {
  const originalBuffer = stringToArrayBuffer(plain);

  const encryptedBuffer = aesEncryptBuffer(originalBuffer, getKey(key));
  return buffer2Base64String(encryptedBuffer);
};
export const aesDecrypt = (encrypted: string, key: string): string => {
  const encryptedBuffer = base64String2Buffer(encrypted);
  const decryptedBuffer = aesDecryptBuffer(encryptedBuffer, getKey(key));
  return arrayBufferToString(bufferToArrayBuffer(decryptedBuffer));
};
export const aesEncryptBuffer = (
  plainBuffer: ArrayBuffer,
  keyBuffer: ArrayBuffer,
): Buffer => {
  const keyLength = keyBuffer.byteLength;
  //console.log('KeyLength', keyLength);
  if (keyLength !== 16 && keyLength !== 32)
    throw new Error('Invalid Key Length');

  const originalData = new DataView(plainBuffer);
  const iv = crypto.randomBytes(16);
  const encryptionKey = new DataView(keyBuffer);

  const cipher = crypto.createCipheriv(
    keyLength === 16 ? 'aes-128-gcm' : 'aes-256-gcm',
    encryptionKey,
    iv,
  );
  const chunks: [Buffer, Buffer] = [
    cipher.update(originalData),
    cipher.final(),
  ];

  const encryptedBuffer = Buffer.concat([
    iv,
    chunks[0],
    chunks[1],
    cipher.getAuthTag(),
  ]);
  return encryptedBuffer;
};

const aesEncryptBufferWithBinaryKey = (
  plainBuffer: ArrayBuffer,
  keyBinary: Uint8Array<ArrayBufferLike>,
): Buffer => {
  const keyLength = keyBinary.byteLength;
  //console.log('KeyLength', keyLength);
  if (keyLength !== 16 && keyLength !== 32)
    throw new Error('Invalid Key Length');

  const originalData = new DataView(plainBuffer);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(
    keyLength === 16 ? 'aes-128-gcm' : 'aes-256-gcm',
    keyBinary,
    iv,
  );
  const chunks: [Buffer, Buffer] = [
    cipher.update(originalData),
    cipher.final(),
  ];

  const encryptedBuffer = Buffer.concat([
    iv,
    chunks[0],
    chunks[1],
    cipher.getAuthTag(),
  ]);
  return encryptedBuffer;
};

export const aesDecryptBuffer = (
  encryptedBuffer: Buffer,
  keyBuffer: ArrayBuffer,
): Buffer => {
  const iv = encryptedBuffer.subarray(0, 16); //Nonce
  const tag = encryptedBuffer.subarray(encryptedBuffer.length - 16); //Tag
  const encryptedData = encryptedBuffer.subarray(
    16,
    encryptedBuffer.length - 16,
  );
  const keyLength = keyBuffer.byteLength;
  const encryptionKey = new DataView(keyBuffer);
  const decipher = crypto.createDecipheriv(
    keyLength === 16 ? 'aes-128-gcm' : 'aes-256-gcm',
    encryptionKey,
    iv,
  );
  const chunks: Buffer[] = [];
  chunks.push(decipher.update(encryptedData));
  decipher.setAuthTag(tag);
  chunks.push(decipher.final());
  return Buffer.concat(chunks);
};

export const aesDecryptBufferWithBinaryKey = (
  encryptedBuffer: Buffer,
  keyBinary: Uint8Array<ArrayBufferLike>,
): Buffer => {
  const iv = encryptedBuffer.subarray(0, 16); //Nonce
  const tag = encryptedBuffer.subarray(encryptedBuffer.length - 16); //Tag
  const encryptedData = encryptedBuffer.subarray(
    16,
    encryptedBuffer.length - 16,
  );
  const keyLength = keyBinary.byteLength;

  const decipher = crypto.createDecipheriv(
    keyLength === 16 ? 'aes-128-gcm' : 'aes-256-gcm',
    keyBinary,
    iv,
  );
  const chunks: Buffer[] = [];
  chunks.push(decipher.update(encryptedData));
  decipher.setAuthTag(tag);
  chunks.push(decipher.final());
  return Buffer.concat(chunks);
};
export const getKey = (key: string): ArrayBuffer => {
  const arrayBuffer: ArrayBuffer = stringToArrayBuffer(fixKeylength(key));
  //console.log(arrayBuffer.byteLength);
  return arrayBuffer;
};
const fixKeylength = (key: string): string => {
  const keyLength = key.length;
  if (keyLength < 16) {
    return key.padEnd(16, ' ');
  } else if (keyLength == 16) {
    return key;
  } else if (keyLength < 32) {
    return key.padEnd(32, ' ');
  } else if (keyLength === 32) {
    return key;
  } else {
    throw new Error('Invalid Key Length: ' + key.length);
  }
};
export const aesEncryptBufferByKeyFile = (
  plainBuffer: ArrayBuffer,
  keyFilename: string,
): Effect.Effect<Buffer, IOError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const keyBuffer = yield* readFromFile(keyFilename);
    return aesEncryptBufferWithBinaryKey(plainBuffer, keyBuffer);
  });

export const aesDecryptBufferByKeyFile = (
  encryptedBuffer: Buffer,
  keyFilename: string,
): Effect.Effect<Buffer, IOError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const keyBuffer = yield* readFromFile(keyFilename);
    return aesDecryptBufferWithBinaryKey(encryptedBuffer, keyBuffer);
  });
