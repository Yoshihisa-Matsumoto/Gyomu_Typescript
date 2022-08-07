import path from 'path';
import fs from 'fs';

test('', () => {});
export const compareFiles = (srcFile: string, destFile: string): boolean => {
  const result = fs.readFileSync(srcFile).equals(fs.readFileSync(destFile));
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
  fs.readdirSync(srcFolder, { withFileTypes: true }).forEach((dirent) => {
    const sourceFullPath = path.join(path.resolve(srcFolder), dirent.name);
    const targetDestFullPath = path.join(path.resolve(destFolder), dirent.name);
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
  destFolder: string
): boolean => {
  fs.readdirSync(destFolder, { withFileTypes: true }).forEach((dirent) => {
    const destinationFullPath = path.join(
      path.resolve(destFolder),
      dirent.name
    );
    const targetSourceFullPath = path.join(
      path.resolve(srcFolder),
      dirent.name
    );
    if (dirent.isFile()) {
      expect(fs.existsSync(targetSourceFullPath)).toBeTruthy();
    } else {
      expect(fs.existsSync(targetSourceFullPath)).toBeTruthy();
      return compareFoldersFromDest(targetSourceFullPath, destinationFullPath);
    }
  });

  return true;
};
