import { FileOperation } from '../fileOperation';
import path from 'path';
import { FileCompareType, FileFilterInfo, FilterType } from '../fileModel';

test('File Whole Search Test', () => {
  const baseDir = path.resolve('.');
  const fileInfoList = FileOperation.search('tests', [], true);
  const fullPathList = new Array<string>();
  fileInfoList.forEach((fileInfo) => {
    fullPathList.push(path.relative(baseDir, fileInfo.fullPath));
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
  ];
  expect(fullPathList).toEqual(expect.arrayContaining(expected));
  expect(expected).toEqual(expect.arrayContaining(fullPathList));
});

test('File Name Exact Search Test', () => {
  const baseDir = path.resolve('.');
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
    fullPathList.push(path.relative(baseDir, fileInfo.fullPath));
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
    fullPathList.push(path.relative(baseDir, fileInfo.fullPath));
  });
  expected = [
    'tests\\compress\\README_aes_password.zip',
    'tests\\source\\folder1\\folder 2\\aes_encryption.py',
  ];
  expect(fullPathList).toEqual(expect.arrayContaining(expected));
  expect(expected).toEqual(expect.arrayContaining(fullPathList));
});

test('File Name NoExact Search Test', () => {
  const baseDir = path.resolve('.');
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
    fullPathList.push(path.relative(baseDir, fileInfo.fullPath));
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
  ];
  expect(fullPathList).toEqual(expect.arrayContaining(expected));
  expect(expected).toEqual(expect.arrayContaining(fullPathList));

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
    fullPathList.push(path.relative(baseDir, fileInfo.fullPath));
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
    fullPathList.push(path.relative(baseDir, fileInfo.fullPath));
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
    fullPathList.push(path.relative(baseDir, fileInfo.fullPath));
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
