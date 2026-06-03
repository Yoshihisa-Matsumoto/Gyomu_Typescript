import { join, resolve, sep } from 'node:path'
import { tmpdir } from 'node:os'
import { Effect, Layer } from 'effect'
import { expect } from 'vitest'
import { MainLayer, PlatformLayer } from '@gyomu/infra'
import { makeRunner } from '@gyomu/schema/effect'
import { pathExists, readDirectoryDetailed, readFromFile } from '@gyomu/infra/fs'
import type { IOError } from '@gyomu/schema'
import type { FileSystem, PlatformError } from 'effect'

export const tmpDir = () => {
  return tmpdir() + sep
}

const nodeTestLayer = Layer.mergeAll(PlatformLayer, MainLayer)
const runNodeWithEnvOrThrow = makeRunner(nodeTestLayer)
const equals = (a: Uint8Array, b: Uint8Array): boolean => {
  if (a.length !== b.length) return false

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }

  return true
}
export const compareFiles = async (srcFile: string, destFile: string) => {
  return await runNodeWithEnvOrThrow(compareFilesEffect(srcFile, destFile))
}

const normalize = (bytes: Uint8Array) => new TextDecoder().decode(bytes).replace(/\r\n/g, '\n')

const equalsText = (a: Uint8Array, b: Uint8Array) => {
  return normalize(a) === normalize(b)
}
const isText = (path: string) => /\.(txt|md|py|csv|html|cfg)$/i.test(path)

export const compareFilesEffect = (srcFile: string, destFile: string) => {
  return Effect.gen(function* () {
    const source = yield* readFromFile(srcFile)
    const destination = yield* readFromFile(destFile)
    if (isText(srcFile)) {
      const result = equalsText(source, destination)
      if (!result) {
        console.log(srcFile, destFile)
      }
      return result
    } else {
      const result = equals(source, destination)
      if (!result) {
        console.log(srcFile, destFile)
      }
      return result
    }
  })
}

export const validateFolders = async (srcFolder: string, destFolder: string) => {
  return await runNodeWithEnvOrThrow(
    Effect.gen(function* () {
      expect(yield* compareFoldersFromSourceEffect(srcFolder, destFolder)).toBeTruthy()
      expect(yield* compareFoldersFromDestEffect(srcFolder, destFolder)).toBeTruthy()
    }),
  )
}
const compareFoldersFromSourceEffect = (
  srcFolder: string,
  destFolder: string,
): Effect.Effect<boolean, PlatformError.PlatformError | IOError, FileSystem.FileSystem> => {
  return Effect.gen(function* () {
    const dirs = yield* readDirectoryDetailed(srcFolder)
    yield* Effect.forEach(
      dirs,
      (dirent) =>
        Effect.gen(function* () {
          const sourceFullPath = join(resolve(srcFolder), dirent.name)

          const targetDestFullPath = join(resolve(destFolder), dirent.name)

          if (dirent.type === 'File') {
            expect(yield* pathExists(targetDestFullPath)).toBeTruthy()

            expect(yield* compareFilesEffect(sourceFullPath, targetDestFullPath)).toBeTruthy()
          } else {
            expect(yield* pathExists(targetDestFullPath)).toBeTruthy()

            // 🔥 再帰もちゃんと yield*
            yield* compareFoldersFromSourceEffect(sourceFullPath, targetDestFullPath)
          }
        }),
      { concurrency: 1 }, // ← テストなので順序保証
    )

    return true
  })
}

const isEmptyDir = (path: string) =>
  Effect.gen(function* () {
    const entries = yield* readDirectoryDetailed(path)
    return entries.length === 0
  })
const compareFoldersFromDestEffect = (
  srcFolder: string,
  destFolder: string,
): Effect.Effect<boolean, PlatformError.PlatformError | IOError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const dirs = yield* readDirectoryDetailed(destFolder)

    yield* Effect.forEach(
      dirs,
      (dirent) =>
        Effect.gen(function* () {
          const destinationFullPath = join(resolve(destFolder), dirent.name)
          if (dirent.type !== 'File') {
            const isEmpty = yield* isEmptyDir(destinationFullPath)

            if (isEmpty) {
              // 👇 無視
              return
            }
          }
          const targetSourceFullPath = join(resolve(srcFolder), dirent.name)

          const exists = yield* pathExists(targetSourceFullPath)

          expect(
            exists,
            `Missing source path: ${targetSourceFullPath} vs ${destinationFullPath}`,
          ).toBeTruthy()

          if (dirent.type !== 'File') {
            // 🔥 再帰は必ず yield*
            yield* compareFoldersFromDestEffect(targetSourceFullPath, destinationFullPath)
          }
        }),
      { concurrency: 1 }, // テストなので順序保証
    )

    return true
  })
