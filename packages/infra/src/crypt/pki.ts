import crypto from 'node:crypto'
import { buffer2Base64String } from '@gyomu/core/shared/encoding'
import { Uint8ArraytoBuffer } from '@gyomu/core/shared/binary'
import { Effect } from 'effect'
import { readFromFile, writeToFile } from '../fs/fs-utils.js'
// import { fs } from '../fs/index.js';

export const pkiEncrypt = (publicKey: Buffer, data: Buffer): Buffer => {
  return crypto.publicEncrypt(publicKey, data)
}

export const pkiFileEncrypt = (publicKeyFilename: string, data: Buffer) =>
  Effect.gen(function* () {
    const keyData = yield* readFromFile(publicKeyFilename)
    return pkiEncrypt(Uint8ArraytoBuffer(keyData), data)
  })

export const pkiFileEncrypt2Base64 = (publicKeyFilename: string, data: Buffer) => {
  return pkiFileEncrypt(publicKeyFilename, data).pipe(
    Effect.map((data2) => buffer2Base64String(data2)),
  )
}
export const pkiEncryptString = (publicKeyFilename: string, data: string) => {
  return pkiFileEncrypt2Base64(publicKeyFilename, Buffer.from(data))
}
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

export const pkiDecrypt = (privateKey: Buffer, data: Buffer): Buffer => {
  return crypto.privateDecrypt(privateKey, data)
}

export const pkiFileDecrypt = (privateKeyFilename: string, data: Buffer) =>
  Effect.gen(function* () {
    const keyBinary = yield* readFromFile(privateKeyFilename)
    return pkiDecrypt(Uint8ArraytoBuffer(keyBinary), data)
  })

export const pkiFileDecrypt2Base64 = (privateKeyFilename: string, data: Buffer) => {
  return pkiFileDecrypt(privateKeyFilename, data).pipe(Effect.map((d) => buffer2Base64String(d)))
}
export const pkiFileDecryptString = (privateKeyFilename: string, data: string) => {
  return pkiFileDecrypt2Base64(privateKeyFilename, Buffer.from(data))
}
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
