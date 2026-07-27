import crypto from 'node:crypto'
import { buffer2Base64String } from '@gyomu/schema/shared/encoding'
import { Uint8ArraytoBuffer } from '@gyomu/schema/shared/binary'
import { Effect } from 'effect'
import { readFromFile, writeToFile } from '../fs/fs-utils.js'
// import { fs } from '../fs/index.js';

/**
 * Encrypts the provided data using the specified public key.
 *
 * @param publicKey The public key to encrypt with.
 *
 * @param data The data to encrypt.
 *
 * @returns Returns the encrypted data as a Buffer.
 */
export const pkiEncrypt = (publicKey: Buffer, data: Buffer): Buffer => {
  return crypto.publicEncrypt(publicKey, data)
}

/**
 * Encrypts data using a public key loaded from a file.
 *
 * @param publicKeyFilename The path to the file containing the public key.
 *
 * @param data The binary data to encrypt.
 *
 * @returns An Effect that yields the encrypted Buffer.
 */
export const pkiFileEncrypt = (publicKeyFilename: string, data: Buffer) =>
  Effect.gen(function* () {
    const keyData = yield* readFromFile(publicKeyFilename)
    return pkiEncrypt(Uint8ArraytoBuffer(keyData), data)
  })

/**
 * Encrypts data using a public key file and returns the result as a Base64 encoded string.
 *
 * @param publicKeyFilename The path to the file containing the public key.
 *
 * @param data The binary data to encrypt.
 *
 * @returns An Effect that yields the Base64 encoded encrypted data.
 */
export const pkiFileEncrypt2Base64 = (publicKeyFilename: string, data: Buffer) => {
  return pkiFileEncrypt(publicKeyFilename, data).pipe(
    Effect.map((data2) => buffer2Base64String(data2)),
  )
}

/**
 * Encrypts a string using a public key file and returns the result as a Base64 encoded string.
 *
 * @param publicKeyFilename The path to the file containing the public key.
 *
 * @param data The string content to encrypt.
 *
 * @returns An Effect that yields the Base64 encoded encrypted string.
 */
export const pkiEncryptString = (publicKeyFilename: string, data: string) => {
  return pkiFileEncrypt2Base64(publicKeyFilename, Buffer.from(data))
}

/**
 * Reads data from a file, encrypts it using a public key file, and writes the result to a new file.
 *
 * @param publicKeyFilename The path to the public key file.
 *
 * @param plainFilename The path to the input file containing plain data.
 *
 * @param encryptedFilename The path where the encrypted output file will be written.
 *
 * @returns An Effect representing the file I/O and encryption workflow.
 */
export const pkiFileEncryptToFile = (
  publicKeyFilename: string,
  plainFilename: string,
  encryptedFilename: string,
) =>
  Effect.gen(function* () {
    const data = yield* readFromFile(plainFilename)
    const encrypted = yield* pkiFileEncrypt(publicKeyFilename, Uint8ArraytoBuffer(data))
    yield* writeToFile(encryptedFilename, encrypted)
  })

/**
 * Decrypts the provided data using the specified private key.
 *
 * @param privateKey The private key to decrypt with.
 *
 * @param data The data to decrypt.
 *
 * @returns Returns the decrypted data as a Buffer.
 */
export const pkiDecrypt = (privateKey: Buffer, data: Buffer): Buffer => {
  return crypto.privateDecrypt(privateKey, data)
}

/**
 * Decrypts data using a private key loaded from a file.
 *
 * @param privateKeyFilename The path to the file containing the private key.
 *
 * @param data The encrypted binary data to decrypt.
 *
 * @returns An Effect that yields the decrypted Buffer.
 */
export const pkiFileDecrypt = (privateKeyFilename: string, data: Buffer) =>
  Effect.gen(function* () {
    const keyBinary = yield* readFromFile(privateKeyFilename)
    return pkiDecrypt(Uint8ArraytoBuffer(keyBinary), data)
  })

/**
 * Decrypts data using a private key file and returns the result as a Base64 encoded string.
 *
 * @param privateKeyFilename The path to the file containing the private key.
 *
 * @param data The encrypted binary data to decrypt.
 *
 * @returns An Effect that yields the Base64 encoded decrypted data.
 */
export const pkiFileDecrypt2Base64 = (privateKeyFilename: string, data: Buffer) => {
  return pkiFileDecrypt(privateKeyFilename, data).pipe(Effect.map((d) => buffer2Base64String(d)))
}

/**
 * Decrypts a string using a private key file and returns the result as a Base64 encoded string.
 *
 * @param privateKeyFilename The path to the file containing the private key.
 *
 * @param data The encrypted data string to decrypt.
 *
 * @returns An Effect that yields the Base64 encoded decrypted string.
 */
export const pkiFileDecryptString = (privateKeyFilename: string, data: string) => {
  return pkiFileDecrypt2Base64(privateKeyFilename, Buffer.from(data))
}

/**
 * Reads encrypted data from a file, decrypts it using a private key file, and writes the result to a new file.
 *
 * @param privateKeyFilename The path to the private key file.
 *
 * @param encryptedFilename The path to the input encrypted file.
 *
 * @param decryptedFilename The path where the decrypted output file will be written.
 *
 * @returns An Effect representing the file I/O and decryption workflow.
 */
export const pkiFileDecryptFile = (
  privateKeyFilename: string,
  encryptedFilename: string,
  decryptedFilename: string,
) =>
  Effect.gen(function* () {
    const encryptedData = yield* readFromFile(encryptedFilename)
    const decryptedData = yield* pkiFileDecrypt(
      privateKeyFilename,
      Uint8ArraytoBuffer(encryptedData),
    )
    yield* writeToFile(decryptedFilename, decryptedData)
  })
