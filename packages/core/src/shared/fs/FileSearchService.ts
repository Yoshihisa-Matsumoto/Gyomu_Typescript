import { Effect, FileSystem, Layer, ServiceMap } from 'effect';
import { FileFilterInfo } from '../../gyomu/file/filter.js';
import { FileCompareType, FilterType } from '../../gyomu/file/types.js';
import { createFileInfo, FileInfo } from '../../infrastructure/fs/fileInfo.js';
import { compareAsc } from 'date-fns';
import { platform } from '../../infrastructure/fs/index.js';
import { IOError } from '../../errors.js';
import {
  pathExists,
  readDirectoryDetailed,
} from '../../infrastructure/fs/fs-utils.js';

const searchFunc = (
  parentDirectory: string,
  filterConditions: FileFilterInfo[],
  isRecursive: boolean = false,
): Effect.Effect<FileInfo[], IOError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    if (!(yield* pathExists(parentDirectory))) {
      return [];
    }

    const dirents = yield* readDirectoryDetailed(parentDirectory);

    const results = yield* Effect.forEach(
      dirents,
      (dirent) =>
        Effect.gen(function* () {
          const fullPath = platform.join(
            platform.resolve(parentDirectory),
            dirent.name,
          );

          // ファイル
          if (dirent.isFile) {
            const [ok, fileInfo] = yield* isFileValid(
              fullPath,
              filterConditions,
            );
            return ok ? [fileInfo] : [];
          }

          // ディレクトリ（再帰）
          if (dirent.isDirectory && isRecursive) {
            return yield* searchFunc(fullPath, filterConditions, isRecursive);
          }

          return [];
        }),
      { concurrency: 1 }, // 順序必要なら
    );

    // flatten
    return results.flat();
  });

const isFileValid = (
  fileFullPath: string,
  filterConditions: FileFilterInfo[],
): Effect.Effect<[boolean, FileInfo], IOError, FileSystem.FileSystem> => {
  let isMatch = true;
  return Effect.gen(function* () {
    const fileInformation = yield* createFileInfo(fileFullPath);

    if (!fileInformation.isFile) return [false, fileInformation];

    if (!filterConditions || filterConditions.length === 0)
      return [true, fileInformation];

    for (const filterInfo of filterConditions) {
      isMatch = isFileValidForFileter(fileInformation, filterInfo);
      if (!isMatch) break;
    }
    return [isMatch, fileInformation];
  });
};
const isFileValidForFileter = (
  fileInformation: FileInfo,
  filterInformation: FileFilterInfo,
): boolean => {
  switch (filterInformation.kind) {
    case FilterType.FileName:
      return isFileNameMatch(
        fileInformation.fileName,
        filterInformation.nameFilter,
        filterInformation.operator,
      );
    case FilterType.CreateTime:
      return isFileDateMatch(
        fileInformation.createTime,
        filterInformation.targetDate,
        filterInformation.operator,
      );
    case FilterType.LastAccessTime:
      return isFileDateMatch(
        fileInformation.lastAccessTime,
        filterInformation.targetDate,
        filterInformation.operator,
      );
    case FilterType.LastModifiedTime:
      return isFileDateMatch(
        fileInformation.updateTime,
        filterInformation.targetDate,
        filterInformation.operator,
      );
  }
};
const isFileNameMatch = (
  fileName: string,
  targetFilter: string,
  compareType: FileCompareType,
): boolean => {
  switch (compareType) {
    case FileCompareType.Equal: {
      const match = fileName.match(targetFilter);
      return !!match && match.length > 0;
    }
    case FileCompareType.Larger:
      return fileName > targetFilter;
    case FileCompareType.LargerOrEqual:
      return fileName >= targetFilter;
    case FileCompareType.Less:
      return fileName < targetFilter;
    case FileCompareType.LessOrEqual:
      return fileName <= targetFilter;
  }
};

const isFileDateMatch = (
  fileDate: Date,
  targetFilter: Date,
  compareType: FileCompareType,
): boolean => {
  const result = compareAsc(fileDate, targetFilter);
  switch (compareType) {
    case FileCompareType.Equal:
      return result === 0;
    case FileCompareType.Larger:
      return result > 0;
    case FileCompareType.LargerOrEqual:
      return result >= 0;
    case FileCompareType.Less:
      return result < 0;
    case FileCompareType.LessOrEqual:
      return result <= 0;
  }
};
export class FileSearchService extends ServiceMap.Service<
  FileSearchService,
  {
    search: (
      parentDirectory: string,
      filterConditions: FileFilterInfo[],
      isRecursive?: boolean,
    ) => Effect.Effect<FileInfo[], IOError, FileSystem.FileSystem>;
  }
>()('FileSearchService', {
  make: Effect.succeed({
    search: searchFunc,
  }),
}) {
  static readonly live = Layer.effect(this, this.make);
}
