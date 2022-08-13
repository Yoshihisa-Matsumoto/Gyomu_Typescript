import crypto from 'crypto';
import { buffer } from 'stream/consumers';
import {
  base64String2Buffer,
  base64String2String,
  buffer2Base64String,
} from './base64';
import {
  arrayBufferToString,
  bufferToArrayBuffer,
  stringToArrayBuffer,
} from './buffer';
import { readFile, readFileSync, writeFileSync } from 'fs';
import { enc } from 'crypto-js';

export const aesEncryptBufferByKeyFile = (
  plainBuffer: ArrayBuffer,
  keyFilename: string
): Buffer => {
  const keyBuffer = readFileSync(keyFilename);
  const keyArrayBuffer = bufferToArrayBuffer(keyBuffer);
  return aesEncryptBuffer(plainBuffer, keyArrayBuffer);
};
export const aesEncrypt = (plain: string, key: string): string => {
  const originalBuffer = stringToArrayBuffer(plain);

  const encryptedBuffer = aesEncryptBuffer(originalBuffer, getKey(key));
  return buffer2Base64String(encryptedBuffer);
};

export const aesEncryptBuffer = (
  plainBuffer: ArrayBuffer,
  keyBuffer: ArrayBuffer
): Buffer => {
  const keyLength = keyBuffer.byteLength;
  console.log('KeyLength', keyLength);
  if (keyLength !== 16 && keyLength !== 32)
    throw new Error('Invalid Key Length');

  const originalData = new DataView(plainBuffer);
  const iv = crypto.randomBytes(16);
  const encryptionKey = new DataView(keyBuffer);

  const cipher = crypto.createCipheriv(
    keyLength === 16 ? 'aes-128-gcm' : 'aes-256-gcm',
    encryptionKey,
    iv
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
  keyBuffer: ArrayBuffer
): Buffer => {
  const iv = encryptedBuffer.subarray(0, 16); //Nonce
  const tag = encryptedBuffer.subarray(encryptedBuffer.length - 16); //Tag
  const encryptedData = encryptedBuffer.subarray(
    16,
    encryptedBuffer.length - 16
  );
  const keyLength = keyBuffer.byteLength;
  const encryptionKey = new DataView(keyBuffer);
  const decipher = crypto.createDecipheriv(
    keyLength === 16 ? 'aes-128-gcm' : 'aes-256-gcm',
    encryptionKey,
    iv
  );
  const chunks: Buffer[] = [];
  chunks.push(decipher.update(encryptedData));
  decipher.setAuthTag(tag);
  chunks.push(decipher.final());
  return Buffer.concat(chunks);
};
export const aesDecryptBufferByKeyFile = (
  encryptedBuffer: Buffer,
  keyFilename: string
): Buffer => {
  const keyBuffer = readFileSync(keyFilename);
  const keyArrayBuffer = bufferToArrayBuffer(keyBuffer);
  return aesDecryptBuffer(encryptedBuffer, keyArrayBuffer);
};
export const aesDecrypt = (encrypted: string, key: string): string => {
  const encryptedBuffer = base64String2Buffer(encrypted);
  const decryptedBuffer = aesDecryptBuffer(encryptedBuffer, getKey(key));
  return arrayBufferToString(decryptedBuffer);
  // const encryptedBuffer = base64String2Buffer(encrypted);
  // const iv = encryptedBuffer.subarray(0, 16); //Nonce
  // const tag = encryptedBuffer.subarray(encryptedBuffer.length - 16); //Tag
  // const encryptedData = encryptedBuffer.subarray(
  //   16,
  //   encryptedBuffer.length - 16
  // );
  // // console.log('Total', encryptedBuffer.byteLength);
  // // console.log('iv', iv.byteLength);
  // // console.log('tag', tag.byteLength);
  // // console.log('encryptedData', encryptedData.byteLength);
  // const encryptionKey = getKey(key);

  // const decipher = crypto.createDecipheriv('aes-128-gcm', encryptionKey, iv);
  // const chunks: Buffer[] = [];
  // chunks.push(decipher.update(encryptedData));
  // decipher.setAuthTag(tag);
  // chunks.push(decipher.final());
  // return bufferToString(Buffer.concat(chunks));
};

const getKey = (key: string): ArrayBuffer => {
  const arrayBuffer: ArrayBuffer = stringToArrayBuffer(fixKeylength(key));
  //console.log(arrayBuffer.byteLength);
  return arrayBuffer;
};
const getKeyOld = (key: string): DataView => {
  const arrayBuffer: ArrayBuffer = stringToArrayBuffer(fixKeylength(key));
  //console.log(arrayBuffer.byteLength);
  return new DataView(arrayBuffer);
};
// const getKey = async (key: string): Promise<CryptoKey> => {
//   const cryptoKey = await crypto.subtle.importKey(
//     'raw',
//     stringToBuffer(fixKeylength(key)),
//     {
//       //this is the algorithm options
//       name: 'AES-GCM',
//       length: 16,
//     },
//     true, // whether the key is extractable
//     ['encrypt', 'decrypt'] // usages
//   );
//   return cryptoKey;
// };

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

export const pkiEncrypt = (publicKey: Buffer, data: Buffer): Buffer => {
  return crypto.publicEncrypt(publicKey, data);
};
// export const keyAESEncrypt2Base64 = (key: Buffer, data: Buffer): string => {
//   return buffer2Base64String(keyAESEncrypt(key, data));
// };
// export const keyAESEncryptString = (key: Buffer, data: string): string => {
//   return keyAESEncrypt2Base64(key, Buffer.from(data));
// };
export const pkiFileEncrypt = (
  publicKeyFilename: string,
  data: Buffer
): Buffer => {
  return pkiEncrypt(readFileSync(publicKeyFilename), data);
};
export const pkiFileEncrypt2Base64 = (
  publicKeyFilename: string,
  data: Buffer
): string => {
  return buffer2Base64String(pkiFileEncrypt(publicKeyFilename, data));
};
export const pkiEncryptString = (
  publicKeyFilename: string,
  data: string
): string => {
  return pkiFileEncrypt2Base64(publicKeyFilename, Buffer.from(data));
};
export const pkiFileEncryptToFile = (
  publicKeyFilename: string,
  plainFilename: string,
  encryptedFilename: string
) => {
  writeFileSync(
    encryptedFilename,
    pkiFileEncrypt(publicKeyFilename, readFileSync(plainFilename))
  );
};

export const pkiDecrypt = (privateKey: Buffer, data: Buffer): Buffer => {
  return crypto.privateDecrypt(privateKey, data);
};
// export const keyAESDecrypt2Base64 = (key: Buffer, data: Buffer): string => {
//   return buffer2Base64String(keyAESDecrypt(key, data));
// };
// export const keyAESDeccryptString = (key: Buffer, data: string): string => {
//   return keyAESDecrypt2Base64(key, Buffer.from(data));
// };
export const pkiFileDecrypt = (
  privateKeyFilename: string,
  data: Buffer
): Buffer => {
  return pkiDecrypt(readFileSync(privateKeyFilename), data);
};
export const pkiFileDecrypt2Base64 = (
  privateKeyFilename: string,
  data: Buffer
): string => {
  return buffer2Base64String(pkiFileDecrypt(privateKeyFilename, data));
};
export const pkiFileDecryptString = (
  privateKeyFilename: string,
  data: string
): string => {
  return pkiFileDecrypt2Base64(privateKeyFilename, Buffer.from(data));
};
export const pkiFileDecryptFile = (
  privateKeyFilename: string,
  encryptedFilename: string,
  decryptedFilename: string
) => {
  writeFileSync(
    decryptedFilename,
    pkiFileDecrypt(privateKeyFilename, readFileSync(encryptedFilename))
  );
};

// export const aesDecryptOld = (encrypted: string, key: string): string => {
//   const encryptedBuffer = base64String2Buffer(encrypted);
//   const iv = encryptedBuffer.subarray(0, 16); //Nonce
//   const tag = encryptedBuffer.subarray(encryptedBuffer.length - 16); //Tag
//   const encryptedData = encryptedBuffer.subarray(
//     16,
//     encryptedBuffer.length - 16
//   );
//   // console.log('Total', encryptedBuffer.byteLength);
//   // console.log('iv', iv.byteLength);
//   // console.log('tag', tag.byteLength);
//   // console.log('encryptedData', encryptedData.byteLength);
//   const encryptionKey = getKeyOld(key);

//   const decipher = crypto.createDecipheriv('aes-128-gcm', encryptionKey, iv);
//   const chunks: Buffer[] = [];
//   chunks.push(decipher.update(encryptedData));
//   decipher.setAuthTag(tag);
//   chunks.push(decipher.final());
//   return arrayBufferToString(Buffer.concat(chunks));
// };
