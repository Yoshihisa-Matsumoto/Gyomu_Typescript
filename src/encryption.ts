import crypto from 'crypto';
import { base64String2Buffer, buffer2Base64String } from './base64';
import {
  bufferToArrayBuffer,
  stringToArrayBuffer,
} from './buffer';
import { readFileSync, writeFileSync } from 'fs';
import forge from 'node-forge';

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
  //console.log('KeyLength', keyLength);
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
  keyBuffer: ArrayBufferLike
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
  //return arrayBufferToString(decryptedBuffer);
  return decryptedBuffer.toString();
};

const getStringByteLength = (stringValue: string): number => {
  //return encodeURIComponent(stringValue).replace(/%../g, 'x').length;
  //
  return new TextEncoder().encode(stringValue).length;
};

/**
 * AES Encryption using forge. No dependency on browser or nodejs
 * @param plain
 * @param keyWithExpected16Or32Length  to support AES 128/256. If length is not proper, then put space afterwards
 * @returns encrypted string with Base64 encoding
 */
export const aesEncrypt2 = (
  plain: string,
  keyWithExpected16Or32Length: string
): string => {
  const normalizedKey = fixKeylength(keyWithExpected16Or32Length);
  const keyLength = getStringByteLength(normalizedKey);
  console.log('KeyLength', keyLength);
  if (keyLength !== 16 && keyLength !== 32)
    throw new Error('Invalid Key Length');

  const iv = forge.random.getBytesSync(16);

  const cipher = forge.cipher.createCipher('AES-GCM', normalizedKey);
  cipher.start({ iv: iv });

  const buffer = new forge.util.ByteStringBuffer(forge.util.encodeUtf8(plain));
  //const buffer = forge.util.createBuffer(plain);
  cipher.update(buffer);
  const pass = cipher.finish();
  if (pass) {
    return forge.util.encode64(
      iv + cipher.output.data + cipher.mode.tag.getBytes()
    );
  } else {
    throw new Error('Fail to Encrypt');
  }
};

/**
 * AES Decryption using Forge
 * No dependency on browser/nodejs
 * @param base64EncodedEncryptionData encrypted string with Base64 Encoding
 * @param keyWithExpected16Or32Length to support AES 128/256. If length is not proper, then put space afterwards
 * @returns decrypted string
 */
export const aesDecrypt2 = (
  base64EncodedEncryptionData: string,
  keyWithExpected16Or32Length: string
): string => {
  const encryptedBuffer = forge.util.decode64(base64EncodedEncryptionData); // base64String2Buffer(encrypted);
  const normalizedKey = fixKeylength(keyWithExpected16Or32Length);

  const iv = encryptedBuffer.substring(0, 16);
  const tag = encryptedBuffer.substring(encryptedBuffer.length - 16); //Tag
  const encryptedData = encryptedBuffer.substring(
    16,
    encryptedBuffer.length - 16
  );

  const encryptionKey = forge.util.createBuffer(normalizedKey);
  const decipher = forge.cipher.createDecipher('AES-GCM', encryptionKey);
  //console.log('tag length:' + getStringByteLength(tag));
  decipher.start({
    iv: iv,
    tag: forge.util.createBuffer(tag),
  });

  decipher.update(forge.util.createBuffer(encryptedData));
  const pass = decipher.finish();
  if (pass) {
    //return decipher.output.toString();
    return forge.util.decodeUtf8(decipher.output.data);
  } else {
    throw new Error('Fail to Decrypt');
  }
};

const getKey = (key: string): ArrayBuffer => {
  const arrayBuffer: ArrayBuffer = stringToArrayBuffer(fixKeylength(key));
  //console.log(arrayBuffer.byteLength);
  return arrayBuffer;
};
// const getKeyOld = (key: string): DataView => {
//   const arrayBuffer: ArrayBuffer = stringToArrayBuffer(fixKeylength(key));
//   //console.log(arrayBuffer.byteLength);
//   return new DataView(arrayBuffer);
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
