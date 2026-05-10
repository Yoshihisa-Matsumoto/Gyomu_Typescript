import path, { join } from 'node:path'
import { FileCompareType, FileFilterInfo, FilterType } from '@gyomu/core/gyomu/file'

import { expect, test } from 'vitest'
import { Effect, Layer } from 'effect'
import { FileSearchService } from '@gyomu/core/shared/fs'
import { MainLayer, PlatformLayer } from '../../layer.js'
import { makeRunner } from '../../../../core/dist/effect/index.js'
import { FileSearchServiceLayer } from '../FileSearchServiceLayer.js'

const nodeTestLayer = Layer.mergeAll(PlatformLayer, MainLayer)
const runNodeWithEnvOrThrow = makeRunner(nodeTestLayer)

const program = (
  parentDirectory: string,
  filterCondition: Array<FileFilterInfo>,
  recursive?: boolean,
) => {
  return Effect.gen(function* () {
    const service = yield* FileSearchService
    return yield* service.search(parentDirectory, filterCondition, recursive)
  })
}

test('File Whole Search Test', async () => {
  const baseDir = path.resolve('.')

  const fileInfoList = await runNodeWithEnvOrThrow(
    program('tests', [], true),
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
    program(
      'tests',
      [new FileFilterInfo(FilterType.FileName, FileCompareType.Equal, 'README.md.gz')],
      true,
    ),
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
    program(
      'tests',
      [new FileFilterInfo(FilterType.FileName, FileCompareType.Equal, '.*aes.*')],
      true,
    ),
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

test('File Name NoExact Search Test', async () => {
  const baseDir = path.resolve('.')
  let fileInfoList = await runNodeWithEnvOrThrow(
    program(
      'tests',
      [new FileFilterInfo(FilterType.FileName, FileCompareType.Larger, 'README.md.gz')],
      true,
    ),
    FileSearchServiceLayer,
  )
  let fullPathList = new Array<string>()
  fileInfoList.forEach((fileInfo) => {
    fullPathList.push(path.relative(baseDir, fileInfo.fullPath))
  })
  let expected = [
    join('tests', 'compress', 'README_aes_password.zip'),
    join('tests', 'compress', 'README_password.zip'),
    join('tests', 'compress', 'compare1.zip'),
    join('tests', 'compress', 'compare2.zip'),
    join('tests', 'compress', 'temp.tar'),
    join('tests', 'compress', 'temp.zip'),
    join('tests', 'compress', 'ユーザー噂.py.bz2'),
    join('tests', 'compress', 'ユーザー噂.py.gz'),

    join('tests', 'key-256.key'),
    join('tests', 'key-256.key.dat'),

    join('tests', 'rsa4096'),
    join('tests', 'rsa4096.pem'),
    join('tests', 'rsa4096.pem.dat'),
    join('tests', 'rsa4096.pub'),
    join('tests', 'rsa4096.pub.pem'),
    join('tests', 'rsa4096.pub.pem.dat'),

    join('tests', 'shiftjis_sample.txt'),

    join('tests', 'source', 'folder1', 'email_sender.py'),
    join('tests', 'source', 'folder1', 'folder 2', 'aes_encryption.py'),
    join('tests', 'source', 'folder1', 'folder 2', 'フォルダ噂～３', 'parameter_access.py'),
    join('tests', 'source', 'folder1', 'folder 2', 'フォルダ噂～３', 'コンフィグ.py'),
    join('tests', 'source', 'folder1', 'folder 2', 'ユーザー噂～.py'),
    join('tests', 'source', 'folder1', 'gyomu_db_model.py'),
    join('tests', 'source', 'setup.cfg'),
    join('tests', 'source', 'ユーザー噂.py'),

    join('tests', 'test.csv.gz'),
    join('tests', 'test.csv.zip'),
    join('tests', 'test.html'),
    join('tests', 'test.shiftjis.csv'),
    join('tests', 'test.utf8.bom.csv'),
    join('tests', 'test.utf8.csv'),

    join('tests', 'utf8_sample.txt'),
    join('tests', 'zipCompareResult.csv'),
  ]
  expect(fullPathList.sort()).toEqual(expected.sort())
  // expect(fullPathList).toEqual(expect.arrayContaining(expected));
  // expect(expected).toEqual(expect.arrayContaining(fullPathList));

  fileInfoList = await runNodeWithEnvOrThrow(
    program(
      'tests',
      [new FileFilterInfo(FilterType.FileName, FileCompareType.LargerOrEqual, 'ユーザー噂.py.bz2')],
      true,
    ),
    FileSearchServiceLayer,
  )
  fullPathList = new Array<string>()
  fileInfoList.forEach((fileInfo) => {
    fullPathList.push(path.relative(baseDir, fileInfo.fullPath))
  })
  expected = [
    join('tests', 'compress', 'ユーザー噂.py.bz2'),
    join('tests', 'compress', 'ユーザー噂.py.gz'),
    join('tests', 'source', 'folder1', 'folder 2', 'ユーザー噂～.py'),
  ]
  expect(fullPathList).toEqual(expect.arrayContaining(expected))
  expect(expected).toEqual(expect.arrayContaining(fullPathList))

  fileInfoList = await runNodeWithEnvOrThrow(
    program(
      'tests',
      [new FileFilterInfo(FilterType.FileName, FileCompareType.Less, 'README_aes_password.zip')],
      true,
    ),
    FileSearchServiceLayer,
  )

  fullPathList = new Array<string>()
  fileInfoList.forEach((fileInfo) => {
    fullPathList.push(path.relative(baseDir, fileInfo.fullPath))
  })
  expected = [
    join('tests', 'compress', 'README.md.bz2'),
    join('tests', 'compress', 'README.md.gz'),
    join('tests', 'source', 'README.md'),
  ]
  expect(fullPathList).toEqual(expect.arrayContaining(expected))
  expect(expected).toEqual(expect.arrayContaining(fullPathList))

  fileInfoList = await runNodeWithEnvOrThrow(
    program(
      'tests',
      [
        new FileFilterInfo(
          FilterType.FileName,
          FileCompareType.LessOrEqual,
          'README_aes_password.zip',
        ),
      ],
      true,
    ),
    FileSearchServiceLayer,
  )

  fullPathList = new Array<string>()
  fileInfoList.forEach((fileInfo) => {
    fullPathList.push(path.relative(baseDir, fileInfo.fullPath))
  })
  expected = [
    join('tests', 'compress', 'README.md.bz2'),
    join('tests', 'compress', 'README.md.gz'),
    join('tests', 'compress', 'README_aes_password.zip'),
    join('tests', 'source', 'README.md'),
  ]
  expect(fullPathList).toEqual(expect.arrayContaining(expected))
  expect(expected).toEqual(expect.arrayContaining(fullPathList))
})
