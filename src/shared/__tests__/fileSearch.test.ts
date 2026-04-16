import { FileFilterInfo } from '../../gyomu/file/filter.js';
import { FileCompareType, FilterType } from '../../gyomu/file/type.js';

import { expect, test } from 'vitest';
import { fs } from '../../infrastructure/fs/index.js';
import { Effect, Layer } from 'effect';
import { MainLayer, PlatformLayer } from '../../infrastructure/layer.js';
import { makeRunner } from '../../infrastructure/runtime.js';
import { FileSearchService } from '../fs/FileSearchService.js';

const nodeTestLayer = Layer.mergeAll(PlatformLayer, MainLayer);
const runNodeWithEnvOrThrow = makeRunner(nodeTestLayer);

const program = (
  parentDirectory: string,
  filterCondition: FileFilterInfo[],
  recursive?: boolean,
) => {
  return Effect.gen(function* () {
    const service = yield* FileSearchService;
    return yield* service.search(parentDirectory, filterCondition, recursive);
  });
};

test('File Whole Search Test', async () => {
  const baseDir = fs.resolve('.');

  const fileInfoList = await runNodeWithEnvOrThrow(
    program('tests', [], true),
    FileSearchService.live,
  );
  const fullPathList = new Array<string>();
  fileInfoList.forEach((fileInfo) => {
    fullPathList.push(fs.relative(baseDir, fileInfo.fullPath));
  });
  const expected = [
    'tests\\compress\\README.md.bz2',
    'tests\\compress\\README.md.gz',
    'tests\\compress\\README_aes_password.zip',
    'tests\\compress\\README_password.zip',
    'tests\\compress\\compare1.zip',
    'tests\\compress\\compare2.zip',
    'tests\\compress\\temp.tar',
    'tests\\compress\\temp.zip',
    'tests\\compress\\ユーザー噂.py.bz2',
    'tests\\compress\\ユーザー噂.py.gz',
    'tests\\shiftjis_sample.txt',
    'tests\\source\\folder1\\email_sender.py',
    'tests\\source\\folder1\\folder 2\\aes_encryption.py',
    'tests\\source\\folder1\\folder 2\\フォルダ噂～３\\parameter_access.py',
    'tests\\source\\folder1\\folder 2\\フォルダ噂～３\\コンフィグ.py',
    'tests\\source\\folder1\\folder 2\\ユーザー噂～.py',
    'tests\\source\\folder1\\gyomu_db_model.py',
    'tests\\source\\README.md',
    'tests\\source\\setup.cfg',
    'tests\\source\\ユーザー噂.py',
    'tests\\utf8_sample.txt',
    'tests\\test.csv.gz',
    'tests\\test.csv.zip',
    'tests\\test.html',
    'tests\\test.shiftjis.csv',
    'tests\\test.utf8.bom.csv',
    'tests\\test.utf8.csv',
    'tests\\key-256.key',
    'tests\\key-256.key.dat',
    'tests\\rsa4096',
    'tests\\rsa4096.pem',
    'tests\\rsa4096.pem.dat',
    'tests\\rsa4096.pub',
    'tests\\rsa4096.pub.pem',
    'tests\\rsa4096.pub.pem.dat',
    'tests\\zipCompareResult.csv',
  ];
  expect(fullPathList.sort()).toEqual(expected.sort());
  // expect(fullPathList).toEqual(expect.arrayContaining(expected));
  // expect(expected).toEqual(expect.arrayContaining(fullPathList));
});

test('File Name Exact Search Test', async () => {
  const baseDir = fs.resolve('.');
  let fileInfoList = await runNodeWithEnvOrThrow(
    program(
      'tests',
      [
        new FileFilterInfo(
          FilterType.FileName,
          FileCompareType.Equal,
          'README.md.gz',
        ),
      ],
      true,
    ),
    FileSearchService.live,
  );

  let fullPathList = new Array<string>();
  fileInfoList.forEach((fileInfo) => {
    fullPathList.push(fs.relative(baseDir, fileInfo.fullPath));
  });
  let expected = ['tests\\compress\\README.md.gz'];
  expect(fullPathList).toEqual(expect.arrayContaining(expected));
  expect(expected).toEqual(expect.arrayContaining(fullPathList));

  fileInfoList = await runNodeWithEnvOrThrow(
    program(
      'tests',
      [
        new FileFilterInfo(
          FilterType.FileName,
          FileCompareType.Equal,
          '.*aes.*',
        ),
      ],
      true,
    ),
    FileSearchService.live,
  );
  fullPathList = new Array<string>();
  fileInfoList.forEach((fileInfo) => {
    fullPathList.push(fs.relative(baseDir, fileInfo.fullPath));
  });
  expected = [
    'tests\\compress\\README_aes_password.zip',
    'tests\\source\\folder1\\folder 2\\aes_encryption.py',
  ];
  expect(fullPathList).toEqual(expect.arrayContaining(expected));
  expect(expected).toEqual(expect.arrayContaining(fullPathList));
});

test('File Name NoExact Search Test', async () => {
  const baseDir = fs.resolve('.');
  let fileInfoList = await runNodeWithEnvOrThrow(
    program(
      'tests',
      [
        new FileFilterInfo(
          FilterType.FileName,
          FileCompareType.Larger,
          'README.md.gz',
        ),
      ],
      true,
    ),
    FileSearchService.live,
  );
  let fullPathList = new Array<string>();
  fileInfoList.forEach((fileInfo) => {
    fullPathList.push(fs.relative(baseDir, fileInfo.fullPath));
  });
  let expected = [
    'tests\\compress\\README_aes_password.zip',
    'tests\\compress\\README_password.zip',
    'tests\\compress\\compare1.zip',
    'tests\\compress\\compare2.zip',
    'tests\\compress\\temp.tar',
    'tests\\compress\\temp.zip',
    'tests\\compress\\ユーザー噂.py.bz2',
    'tests\\compress\\ユーザー噂.py.gz',
    'tests\\key-256.key',
    'tests\\key-256.key.dat',
    'tests\\rsa4096',
    'tests\\rsa4096.pem',
    'tests\\rsa4096.pem.dat',
    'tests\\rsa4096.pub',
    'tests\\rsa4096.pub.pem',
    'tests\\rsa4096.pub.pem.dat',
    'tests\\shiftjis_sample.txt',
    'tests\\source\\folder1\\email_sender.py',
    'tests\\source\\folder1\\folder 2\\aes_encryption.py',
    'tests\\source\\folder1\\folder 2\\フォルダ噂～３\\parameter_access.py',
    'tests\\source\\folder1\\folder 2\\フォルダ噂～３\\コンフィグ.py',
    'tests\\source\\folder1\\folder 2\\ユーザー噂～.py',
    'tests\\source\\folder1\\gyomu_db_model.py',
    'tests\\source\\setup.cfg',
    'tests\\source\\ユーザー噂.py',
    'tests\\test.csv.gz',
    'tests\\test.csv.zip',
    'tests\\test.html',
    'tests\\test.shiftjis.csv',
    'tests\\test.utf8.bom.csv',
    'tests\\test.utf8.csv',
    'tests\\utf8_sample.txt',
    'tests\\zipCompareResult.csv',
  ];
  expect(fullPathList.sort()).toEqual(expected.sort());
  // expect(fullPathList).toEqual(expect.arrayContaining(expected));
  // expect(expected).toEqual(expect.arrayContaining(fullPathList));

  fileInfoList = await runNodeWithEnvOrThrow(
    program(
      'tests',
      [
        new FileFilterInfo(
          FilterType.FileName,
          FileCompareType.LargerOrEqual,
          'ユーザー噂.py.bz2',
        ),
      ],
      true,
    ),
    FileSearchService.live,
  );
  fullPathList = new Array<string>();
  fileInfoList.forEach((fileInfo) => {
    fullPathList.push(fs.relative(baseDir, fileInfo.fullPath));
  });
  expected = [
    'tests\\compress\\ユーザー噂.py.bz2',
    'tests\\compress\\ユーザー噂.py.gz',
    'tests\\source\\folder1\\folder 2\\ユーザー噂～.py',
  ];
  expect(fullPathList).toEqual(expect.arrayContaining(expected));
  expect(expected).toEqual(expect.arrayContaining(fullPathList));

  fileInfoList = await runNodeWithEnvOrThrow(
    program(
      'tests',
      [
        new FileFilterInfo(
          FilterType.FileName,
          FileCompareType.Less,
          'README_aes_password.zip',
        ),
      ],
      true,
    ),
    FileSearchService.live,
  );

  fullPathList = new Array<string>();
  fileInfoList.forEach((fileInfo) => {
    fullPathList.push(fs.relative(baseDir, fileInfo.fullPath));
  });
  expected = [
    'tests\\compress\\README.md.bz2',
    'tests\\compress\\README.md.gz',
    'tests\\source\\README.md',
  ];
  expect(fullPathList).toEqual(expect.arrayContaining(expected));
  expect(expected).toEqual(expect.arrayContaining(fullPathList));

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
    FileSearchService.live,
  );

  fullPathList = new Array<string>();
  fileInfoList.forEach((fileInfo) => {
    fullPathList.push(fs.relative(baseDir, fileInfo.fullPath));
  });
  expected = [
    'tests\\compress\\README.md.bz2',
    'tests\\compress\\README.md.gz',
    'tests\\compress\\README_aes_password.zip',
    'tests\\source\\README.md',
  ];
  expect(fullPathList).toEqual(expect.arrayContaining(expected));
  expect(expected).toEqual(expect.arrayContaining(fullPathList));
});
