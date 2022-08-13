import * as aes from '../encryption';
import fs, { readFileSync } from 'fs';
import { bufferToArrayBuffer } from '../buffer';
import { tmpName, tmpNameSync } from 'tmp';
import { compareFiles } from './baseClass';

test('aes gcm decode compatibility with other library encoded data', () => {
  const csharp_result =
    'h6QYCpU8SqaRBUeGFTO0esu4SNBUVlIYzEQkYh1W6j9qmgT0OoEZuUvj';
  const key = 'abc';
  const expected_result = 'Hello$Test';
  const decrypted_data = aes.aesDecrypt(csharp_result, key);
  expect(decrypted_data).toEqual(expected_result);
});

test('Normal AES Encrypt/Decrypt Test', () => {
  const plain = 'Hello$Test';
  const key = 'abc';
  const encData = aes.aesEncrypt(plain, key);
  //console.log('Encrypt:', encData);
  expect(plain).toEqual(aes.aesDecrypt(encData, key));
  const key2 = 'abcdefghijklmnop';
  const encData2 = aes.aesEncrypt(plain, key2);
  expect(plain).toEqual(aes.aesDecrypt(encData2, key2));
});

test('AES Decrypt Error Test', () => {
  const plain = 'Hello$Test';
  const key = 'abc';
  const encData = aes.aesEncrypt(plain, key);
  const key2 = 'abcdefghijklmnop';
  expect(() => {
    aes.aesDecrypt(encData, key2);
  }).toThrowError('Unsupported state or unable to authenticate data');
});

test('Invalid AES Key Encrypt Test', () => {
  const plain = 'Hello$Test';
  const key = 'abcdefghijklmnoprstuvwxyz012345678';
  expect(() => {
    aes.aesEncrypt(plain, key);
  }).toThrow('Invalid Key Length:');
});

test('AES Encrypt/Decrypt using binary file key', () => {
  const keyFilename = './tests/key-256.key';
  // const keyBuffer = fs.readFileSync(keyFilename);
  // const keyBufferArrary = bufferToArrayBuffer(keyBuffer);
  const plainFilename = './tests/utf8_sample.txt';
  const plainBuffer = fs.readFileSync(plainFilename);
  const encryptedBuffer = aes.aesEncryptBufferByKeyFile(
    bufferToArrayBuffer(plainBuffer),
    keyFilename
  );
  const decryptedBuffer = aes.aesDecryptBufferByKeyFile(
    encryptedBuffer,
    keyFilename
  );
  expect(plainBuffer.equals(decryptedBuffer)).toBeTruthy();
});

test('PKI Encrypt/Decrypt using key pair file', () => {
  const privateKey = './tests/rsa4096';
  const publicKey = './tests/rsa4096.pub.pem';
  const plainFilename = './tests/utf8_sample.txt';
  const encryptedFilename = tmpNameSync();
  const decryptedFilename = tmpNameSync();
  aes.pkiFileEncryptToFile(publicKey, plainFilename, encryptedFilename);
  aes.pkiFileDecryptFile(privateKey, encryptedFilename, decryptedFilename);
  const isEqual = compareFiles(plainFilename, decryptedFilename);
  expect(isEqual).toBeTruthy();
});
