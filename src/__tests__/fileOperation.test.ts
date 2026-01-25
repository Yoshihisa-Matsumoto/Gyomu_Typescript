import { FileOperation } from '../fileOperation';

import { FileCompareType, FileFilterInfo, FilterType } from '../fileModel';

import tmp from 'tmp';
import { expect, test } from 'vitest';
import { platform } from '../platform';
import { platformConstants } from '../platform/common';

test('File Whole Search Test', () => {
  const baseDir = platform.resolve('.');
  const fileInfoList = FileOperation.search('tests', [], true);
  const fullPathList = new Array<string>();
  fileInfoList.forEach((fileInfo) => {
    fullPathList.push(platform.relative(baseDir, fileInfo.fullPath));
  });
  let expected = [
    'tests\\compress\\README.md.bz2',
    'tests\\compress\\README.md.gz',
    'tests\\compress\\README_aes_password.zip',
    'tests\\compress\\README_password.zip',
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
    'tests\\test.html',
    'tests\\key-256.key',
    'tests\\rsa4096',
    'tests\\rsa4096.pem',
    'tests\\rsa4096.pub',
    'tests\\rsa4096.pub.pem',
  ];
  expect(fullPathList.sort()).toEqual(expected.sort());
  // expect(fullPathList).toEqual(expect.arrayContaining(expected));
  // expect(expected).toEqual(expect.arrayContaining(fullPathList));
});

test('File Name Exact Search Test', () => {
  const baseDir = platform.resolve('.');
  let fileInfoList = FileOperation.search(
    'tests',
    [
      new FileFilterInfo(
        FilterType.FileName,
        FileCompareType.Equal,
        'README.md.gz'
      ),
    ],
    true
  );
  let fullPathList = new Array<string>();
  fileInfoList.forEach((fileInfo) => {
    fullPathList.push(platform.relative(baseDir, fileInfo.fullPath));
  });
  let expected = ['tests\\compress\\README.md.gz'];
  expect(fullPathList).toEqual(expect.arrayContaining(expected));
  expect(expected).toEqual(expect.arrayContaining(fullPathList));

  fileInfoList = FileOperation.search(
    'tests',
    [new FileFilterInfo(FilterType.FileName, FileCompareType.Equal, '.*aes.*')],
    true
  );
  fullPathList = new Array<string>();
  fileInfoList.forEach((fileInfo) => {
    fullPathList.push(platform.relative(baseDir, fileInfo.fullPath));
  });
  expected = [
    'tests\\compress\\README_aes_password.zip',
    'tests\\source\\folder1\\folder 2\\aes_encryption.py',
  ];
  expect(fullPathList).toEqual(expect.arrayContaining(expected));
  expect(expected).toEqual(expect.arrayContaining(fullPathList));
});

test('File Name NoExact Search Test', () => {
  const baseDir = platform.resolve('.');
  let fileInfoList = FileOperation.search(
    'tests',
    [
      new FileFilterInfo(
        FilterType.FileName,
        FileCompareType.Larger,
        'README.md.gz'
      ),
    ],
    true
  );
  let fullPathList = new Array<string>();
  fileInfoList.forEach((fileInfo) => {
    fullPathList.push(platform.relative(baseDir, fileInfo.fullPath));
  });
  let expected = [
    'tests\\compress\\README_aes_password.zip',
    'tests\\compress\\README_password.zip',
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
    'tests\\source\\setup.cfg',
    'tests\\source\\ユーザー噂.py',
    'tests\\utf8_sample.txt',
    'tests\\key-256.key',
    'tests\\rsa4096',
    'tests\\rsa4096.pem',
    'tests\\rsa4096.pub',
    'tests\\rsa4096.pub.pem',
    'tests\\test.html',
  ];
  expect(fullPathList.sort()).toEqual(expected.sort());
  // expect(fullPathList).toEqual(expect.arrayContaining(expected));
  // expect(expected).toEqual(expect.arrayContaining(fullPathList));

  fileInfoList = FileOperation.search(
    'tests',
    [
      new FileFilterInfo(
        FilterType.FileName,
        FileCompareType.LargerOrEqual,
        'ユーザー噂.py.bz2'
      ),
    ],
    true
  );
  fullPathList = new Array<string>();
  fileInfoList.forEach((fileInfo) => {
    fullPathList.push(platform.relative(baseDir, fileInfo.fullPath));
  });
  expected = [
    'tests\\compress\\ユーザー噂.py.bz2',
    'tests\\compress\\ユーザー噂.py.gz',
    'tests\\source\\folder1\\folder 2\\ユーザー噂～.py',
  ];
  expect(fullPathList).toEqual(expect.arrayContaining(expected));
  expect(expected).toEqual(expect.arrayContaining(fullPathList));

  fileInfoList = FileOperation.search(
    'tests',
    [
      new FileFilterInfo(
        FilterType.FileName,
        FileCompareType.Less,
        'README_aes_password.zip'
      ),
    ],
    true
  );
  fullPathList = new Array<string>();
  fileInfoList.forEach((fileInfo) => {
    fullPathList.push(platform.relative(baseDir, fileInfo.fullPath));
  });
  expected = [
    'tests\\compress\\README.md.bz2',
    'tests\\compress\\README.md.gz',
    'tests\\source\\README.md',
  ];
  expect(fullPathList).toEqual(expect.arrayContaining(expected));
  expect(expected).toEqual(expect.arrayContaining(fullPathList));

  fileInfoList = FileOperation.search(
    'tests',
    [
      new FileFilterInfo(
        FilterType.FileName,
        FileCompareType.LessOrEqual,
        'README_aes_password.zip'
      ),
    ],
    true
  );
  fullPathList = new Array<string>();
  fileInfoList.forEach((fileInfo) => {
    fullPathList.push(platform.relative(baseDir, fileInfo.fullPath));
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

test('File Exclusive Access Test', async () => {
  //const sourceDirectory = platform.resolve('./tests');
  let targetFilename = tmp.tmpNameSync();

  let fileHandle = platform.openSync(
    targetFilename,
    'w',
    platformConstants.O_RDWR | platformConstants.O_EXCL
  );

  let currentDate = new Date().getTime();
  let targetDate = currentDate + 1000;

  let timerId = setInterval(() => {
    platform.writeSync(fileHandle, 'a');
    if (targetDate < new Date().getTime()) {
      clearInterval(timerId);
      platform.closeSync(fileHandle);
    }
  }, 100);

  let result = await FileOperation.waitTillExclusiveAccess(targetFilename, 2);
  let finishDate = new Date().getTime();
  expect(result.isOk()).toBeTruthy();
  if(result.isErr()){
    return;
  }
  let duration = finishDate - currentDate;
  //expect(result.value).toBeTruthy();
  expect(duration).toBeGreaterThan(500);
  expect(duration).toBeLessThan(2200);
  console.log('duration', duration);
  //console.log('test2');
  targetFilename = tmp.tmpNameSync();

  fileHandle = platform.openSync(
    targetFilename,
    'w',
    platformConstants.O_RDWR | platformConstants.O_EXCL
  );

  currentDate = new Date().getTime();
  targetDate = currentDate + 2000;
  platform.writeSync(fileHandle, 'a');
  timerId = setInterval(() => {
    platform.writeSync(fileHandle, 'a');
    if (targetDate < new Date().getTime()) {
      clearInterval(timerId);
      platform.closeSync(fileHandle);
    }
    //console.log('written', new Date());
  }, 50);
  result = await FileOperation.waitTillExclusiveAccess(targetFilename, 1);
  clearInterval(timerId);
  if (!result.isOk()) console.log(result.error);
  expect(result.isOk()).toBeTruthy();
  if (result.isOk()) {
    expect(result.value).toBeFalsy();
  }
}, 10000);
