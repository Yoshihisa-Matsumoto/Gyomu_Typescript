import { expect } from 'vitest';
import { platform } from '../platform';

export const compareFiles = (srcFile: string, destFile: string): boolean => {
  const result = platform
    .readFileSync(srcFile)
    .equals(platform.readFileSync(destFile));
  if (!result) {
    console.log(srcFile, destFile);
  }
  return result;
};

export const validateFolders = (srcFolder: string, destFolder: string) => {
  expect(compareFoldersFromSource(srcFolder, destFolder)).toBeTruthy();
  expect(compareFoldersFromDest(srcFolder, destFolder)).toBeTruthy();
};
const compareFoldersFromSource = (
  srcFolder: string,
  destFolder: string
): boolean => {
  platform.readdirSync(srcFolder, { withFileTypes: true }).forEach((dirent) => {
    const sourceFullPath = platform.join(
      platform.resolve(srcFolder),
      dirent.name
    );
    const targetDestFullPath = platform.join(
      platform.resolve(destFolder),
      dirent.name
    );
    if (dirent.isFile()) {
      expect(platform.existsSync(targetDestFullPath)).toBeTruthy();
      expect(compareFiles(sourceFullPath, targetDestFullPath)).toBeTruthy();
    } else {
      //console.log(targetDestFullPath);
      expect(platform.existsSync(targetDestFullPath)).toBeTruthy();
      return compareFoldersFromSource(sourceFullPath, targetDestFullPath);
    }
  });

  return true;
};
const compareFoldersFromDest = (
  srcFolder: string,
  destFolder: string
): boolean => {
  platform
    .readdirSync(destFolder, { withFileTypes: true })
    .forEach((dirent) => {
      const destinationFullPath = platform.join(
        platform.resolve(destFolder),
        dirent.name
      );
      const targetSourceFullPath = platform.join(
        platform.resolve(srcFolder),
        dirent.name
      );
      if (dirent.isFile()) {
        expect(platform.existsSync(targetSourceFullPath)).toBeTruthy();
      } else {
        expect(platform.existsSync(targetSourceFullPath)).toBeTruthy();
        return compareFoldersFromDest(
          targetSourceFullPath,
          destinationFullPath
        );
      }
    });

  return true;
};
