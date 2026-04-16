import { fs } from '../fs/index.js';
import { expect } from 'vitest';

export const tmpDir = () => {
  return fs.tmpdir() + fs.sep;
};

export const compareFiles = (srcFile: string, destFile: string): boolean => {
  const source: Buffer = fs.readFileSync(srcFile);
  const destination: Buffer = fs.readFileSync(destFile);
  const result = source.equals(
    destination as any as Uint8Array<ArrayBufferLike>,
  );
  if (!result) {
    console.log(srcFile, destFile);
  }
  return result;
};

export const validateTextFiles = (srcFile: string, destFile: string) => {
  const srcData = fs
    .readFileSync(srcFile)
    .toString()
    .replace(/\r\n|\r/g, '\n');
  const destData = fs
    .readFileSync(destFile)
    .toString()
    .replace(/\r\n|\r/g, '\n');

  expect(srcData).toBe(destData);
};

export const validateFolders = (srcFolder: string, destFolder: string) => {
  expect(compareFoldersFromSource(srcFolder, destFolder)).toBeTruthy();
  expect(compareFoldersFromDest(srcFolder, destFolder)).toBeTruthy();
};
const compareFoldersFromSource = (
  srcFolder: string,
  destFolder: string,
): boolean => {
  fs.readdirSync(srcFolder, { withFileTypes: true }).forEach((dirent) => {
    const sourceFullPath = fs.join(fs.resolve(srcFolder), dirent.name);
    const targetDestFullPath = fs.join(fs.resolve(destFolder), dirent.name);
    if (dirent.isFile()) {
      expect(fs.existsSync(targetDestFullPath)).toBeTruthy();
      expect(compareFiles(sourceFullPath, targetDestFullPath)).toBeTruthy();
    } else {
      //console.log(targetDestFullPath);
      expect(fs.existsSync(targetDestFullPath)).toBeTruthy();
      return compareFoldersFromSource(sourceFullPath, targetDestFullPath);
    }
  });

  return true;
};
const compareFoldersFromDest = (
  srcFolder: string,
  destFolder: string,
): boolean => {
  fs.readdirSync(destFolder, { withFileTypes: true }).forEach((dirent) => {
    const destinationFullPath = fs.join(fs.resolve(destFolder), dirent.name);
    const targetSourceFullPath = fs.join(fs.resolve(srcFolder), dirent.name);
    if (dirent.isFile()) {
      expect(fs.existsSync(targetSourceFullPath)).toBeTruthy();
    } else {
      expect(fs.existsSync(targetSourceFullPath)).toBeTruthy();
      return compareFoldersFromDest(targetSourceFullPath, destinationFullPath);
    }
  });

  return true;
};
