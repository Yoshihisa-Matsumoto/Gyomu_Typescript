import crypto from 'crypto';
import { buffer2Base64String } from '../../shared/encoding/base64.js';
import { platform } from '../fs/index.js';
import { loadKeyFromFile } from './keyLoader.js';

export const pkiEncrypt = (publicKey: Buffer, data: Buffer): Buffer => {
  return crypto.publicEncrypt(publicKey, data);
};

export const pkiFileEncrypt = (
  publicKeyFilename: string,
  data: Buffer,
): Buffer => {
  return pkiEncrypt(loadKeyFromFile(publicKeyFilename), data);
};
export const pkiFileEncrypt2Base64 = (
  publicKeyFilename: string,
  data: Buffer,
): string => {
  return buffer2Base64String(pkiFileEncrypt(publicKeyFilename, data));
};
export const pkiEncryptString = (
  publicKeyFilename: string,
  data: string,
): string => {
  return pkiFileEncrypt2Base64(publicKeyFilename, Buffer.from(data));
};
export const pkiFileEncryptToFile = (
  publicKeyFilename: string,
  plainFilename: string,
  encryptedFilename: string,
) => {
  platform.writeFileSync(
    encryptedFilename,
    pkiFileEncrypt(publicKeyFilename, loadKeyFromFile(plainFilename)),
  );
};

export const pkiDecrypt = (privateKey: Buffer, data: Buffer): Buffer => {
  return crypto.privateDecrypt(privateKey, data);
};

export const pkiFileDecrypt = (
  privateKeyFilename: string,
  data: Buffer,
): Buffer => {
  return pkiDecrypt(loadKeyFromFile(privateKeyFilename), data);
};
export const pkiFileDecrypt2Base64 = (
  privateKeyFilename: string,
  data: Buffer,
): string => {
  return buffer2Base64String(pkiFileDecrypt(privateKeyFilename, data));
};
export const pkiFileDecryptString = (
  privateKeyFilename: string,
  data: string,
): string => {
  return pkiFileDecrypt2Base64(privateKeyFilename, Buffer.from(data));
};
export const pkiFileDecryptFile = (
  privateKeyFilename: string,
  encryptedFilename: string,
  decryptedFilename: string,
) => {
  platform.writeFileSync(
    decryptedFilename,
    pkiFileDecrypt(privateKeyFilename, loadKeyFromFile(encryptedFilename)),
  );
};
