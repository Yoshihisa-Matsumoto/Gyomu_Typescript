import path, { join } from 'node:path'

import { describe, expect, test } from 'vitest'
import { Effect, Layer } from 'effect'
import { FileSearchService } from '@gyomu/schema/shared/fs'
import { makeRunner } from '@gyomu/schema/effect'
import { MainLayer, PlatformLayer } from '../../layer.js'
import { FileSearchServiceLayer } from '../FileSearchServiceLayer.js'
import type { FileSearchQuery } from '@gyomu/schema/shared/fs'

const nodeTestLayer = Layer.mergeAll(PlatformLayer, MainLayer)
const runNodeWithEnvOrThrow = makeRunner(nodeTestLayer)

const program = (query: FileSearchQuery) => {
  return Effect.gen(function* () {
    const service = yield* FileSearchService
    return yield* service.search(query)
  })
}

describe('FileSearch Test', () => {
  test('File Whole Search Test', async () => {
    const baseDir = path.resolve('.')

    const fileInfoList = await runNodeWithEnvOrThrow(
      program({
        parentDirectory: 'tests',
        recursive: true,
      }),
      FileSearchServiceLayer,
    )
    const fullPathList = new Array<string>()
    fileInfoList.forEach((fileInfo) => {
      fullPathList.push(path.relative(baseDir, fileInfo.fullPath))
    })
    const expected = [
      join('tests', 'compress', 'README.md.bz2'),
      join('tests', 'compress', 'README.md.gz'),
      join('tests', 'compress', 'README_aes_password.zip'),
      join('tests', 'compress', 'README_password.zip'),
      join('tests', 'compress', 'compare1.zip'),
      join('tests', 'compress', 'compare2.zip'),
      join('tests', 'compress', 'temp.tar'),
      join('tests', 'compress', 'temp.zip'),
      join('tests', 'compress', 'ユーザー噂.py.bz2'),
      join('tests', 'compress', 'ユーザー噂.py.gz'),

      join('tests', 'shiftjis_sample.txt'),

      join('tests', 'source', 'folder1', 'email_sender.py'),
      join('tests', 'source', 'folder1', 'folder 2', 'aes_encryption.py'),
      join('tests', 'source', 'folder1', 'folder 2', 'フォルダ噂～３', 'parameter_access.py'),
      join('tests', 'source', 'folder1', 'folder 2', 'フォルダ噂～３', 'コンフィグ.py'),
      join('tests', 'source', 'folder1', 'folder 2', 'ユーザー噂～.py'),
      join('tests', 'source', 'folder1', 'gyomu_db_model.py'),
      join('tests', 'source', 'README.md'),
      join('tests', 'source', 'setup.cfg'),
      join('tests', 'source', 'ユーザー噂.py'),

      join('tests', 'utf8_sample.txt'),

      join('tests', 'test.csv.gz'),
      join('tests', 'test.csv.zip'),
      join('tests', 'test.html'),
      join('tests', 'test.shiftjis.csv'),
      join('tests', 'test.utf8.bom.csv'),
      join('tests', 'test.utf8.csv'),

      join('tests', 'key-256.key'),
      join('tests', 'key-256.key.dat'),
      join('tests', 'rsa4096'),
      join('tests', 'rsa4096.pem'),
      join('tests', 'rsa4096.pem.dat'),
      join('tests', 'rsa4096.pub'),
      join('tests', 'rsa4096.pub.pem'),
      join('tests', 'rsa4096.pub.pem.dat'),

      join('tests', 'zipCompareResult.csv'),
    ]
    expect(fullPathList.sort()).toEqual(expected.sort())
    // expect(fullPathList).toEqual(expect.arrayContaining(expected));
    // expect(expected).toEqual(expect.arrayContaining(fullPathList));
  })

  test('File Name Exact Search Test', async () => {
    const baseDir = path.resolve('.')
    let fileInfoList = await runNodeWithEnvOrThrow(
      program({
        parentDirectory: 'tests',

        includes: ['**/README.md.gz'],
      }),
      FileSearchServiceLayer,
    )

    let fullPathList = new Array<string>()
    fileInfoList.forEach((fileInfo) => {
      fullPathList.push(path.relative(baseDir, fileInfo.fullPath))
    })
    let expected = [join('tests', 'compress', 'README.md.gz')]
    expect(fullPathList).toEqual(expect.arrayContaining(expected))
    expect(expected).toEqual(expect.arrayContaining(fullPathList))

    fileInfoList = await runNodeWithEnvOrThrow(
      program({
        parentDirectory: 'tests',

        includes: ['**/*aes*'],
      }),
      FileSearchServiceLayer,
    )
    fullPathList = new Array<string>()
    fileInfoList.forEach((fileInfo) => {
      fullPathList.push(path.relative(baseDir, fileInfo.fullPath))
    })
    expected = [
      join('tests', 'compress', 'README_aes_password.zip'),
      join('tests', 'source', 'folder1', 'folder 2', 'aes_encryption.py'),
    ]
    expect(fullPathList).toEqual(expect.arrayContaining(expected))
    expect(expected).toEqual(expect.arrayContaining(fullPathList))
  })
  test('Exclude Pattern Test', async () => {
    const fileInfoList = await runNodeWithEnvOrThrow(
      program({
        parentDirectory: 'tests',

        includes: ['**/*.py'],

        excludes: ['**/folder 2/**'],
      }),
      FileSearchServiceLayer,
    )
    expect(fileInfoList.find((f) => f.fullPath.includes('folder 2'))).toBeUndefined()
    expect(fileInfoList.length).toBeGreaterThan(1)
  })
})
