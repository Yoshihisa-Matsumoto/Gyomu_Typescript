import { aesDecrypt, aesEncrypt } from '../aes_encryption';

test('aes gcm decode compatibility with other library encoded data', () => {
  const csharp_result =
    'h6QYCpU8SqaRBUeGFTO0esu4SNBUVlIYzEQkYh1W6j9qmgT0OoEZuUvj';
  const key = 'abc';
  const expected_result = 'Hello$Test';
  const decrypted_data = aesDecrypt(csharp_result, key);
  expect(decrypted_data).toEqual(expected_result);
});

test('Normal AES Encrypt/Decrypt Test', () => {
  const plain = 'Hello$Test';
  const key = 'abc';
  const encData = aesEncrypt(plain, key);
  //console.log('Encrypt:', encData);
  expect(plain).toEqual(aesDecrypt(encData, key));
  const key2 = 'abcdefghijklmnop';
  const encData2 = aesEncrypt(plain, key2);
  expect(plain).toEqual(aesDecrypt(encData2, key2));
});

test('AES Decrypt Error Test', () => {
  const plain = 'Hello$Test';
  const key = 'abc';
  const encData = aesEncrypt(plain, key);
  const key2 = 'abcdefghijklmnop';
  expect(() => {
    aesDecrypt(encData, key2);
  }).toThrowError('Unsupported state or unable to authenticate data');
});

test('Invalid AES Key Encrypt Test', () => {
  const plain = 'Hello$Test';
  const key = 'abcdefghijklmnopr';
  expect(() => {
    aesEncrypt(plain, key);
  }).toThrow('Invalid Key Length:');
});
