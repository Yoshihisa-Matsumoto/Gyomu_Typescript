import crypto from 'crypto';
import { buffer } from 'stream/consumers';
import { base64String2Buffer, buffer2Base64String } from './base64';
import { bufferToString, stringToBufferArray } from './buffer';

export const aesEncrypt = (plain: string, key: string): string => {
  const originalBuffer = stringToBufferArray(plain);
  const originalData = new DataView(originalBuffer);
  const iv = crypto.randomBytes(16);
  const encryptionKey = getKey(key);
  const cipher = crypto.createCipheriv('aes-128-gcm', encryptionKey, iv);
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
  return buffer2Base64String(encryptedBuffer);
};

export const aesDecrypt = (encrypted: string, key: string): string => {
  const encryptedBuffer = base64String2Buffer(encrypted);
  const iv = encryptedBuffer.subarray(0, 16); //Nonce
  const tag = encryptedBuffer.subarray(encryptedBuffer.length - 16); //Tag
  const encryptedData = encryptedBuffer.subarray(
    16,
    encryptedBuffer.length - 16
  );
  // console.log('Total', encryptedBuffer.byteLength);
  // console.log('iv', iv.byteLength);
  // console.log('tag', tag.byteLength);
  // console.log('encryptedData', encryptedData.byteLength);
  const encryptionKey = getKey(key);

  const decipher = crypto.createDecipheriv('aes-128-gcm', encryptionKey, iv);
  const chunks: Buffer[] = [];
  chunks.push(decipher.update(encryptedData));
  decipher.setAuthTag(tag);
  chunks.push(decipher.final());
  return bufferToString(Buffer.concat(chunks));
};

const getKey = (key: string): DataView => {
  const arrayBuffer: ArrayBuffer = stringToBufferArray(fixKeylength(key));
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
  } else {
    throw new Error('Invalid Key Length: ' + key.length);
  }
};
