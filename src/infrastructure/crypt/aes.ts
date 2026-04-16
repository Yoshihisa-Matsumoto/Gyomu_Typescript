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
import { loadKeyFromFile } from './keyLoader.js';

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
}; // const getStringByteLength = (stringValue: string): number => {
//   //return encodeURIComponent(stringValue).replace(/%../g, 'x').length;
//   //
//   return new TextEncoder().encode(stringValue).length;
// };
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
): Buffer => {
  const keyBuffer = loadKeyFromFile(keyFilename);
  const keyArrayBuffer = bufferToArrayBuffer(keyBuffer);
  return aesEncryptBuffer(plainBuffer, keyArrayBuffer);
};
export const aesDecryptBufferByKeyFile = (
  encryptedBuffer: Buffer,
  keyFilename: string,
): Buffer => {
  const keyBuffer = loadKeyFromFile(keyFilename);
  const keyArrayBuffer = bufferToArrayBuffer(keyBuffer);
  return aesDecryptBuffer(encryptedBuffer, keyArrayBuffer);
};
