import { Effect, Layer, ServiceMap } from 'effect';
import { FileFilterInfo } from '../../gyomu/file/filter.js';
import { FileCompareType, FilterType } from '../../gyomu/file/type.js';
import { FileInfo } from '../../infrastructure/fs/fileInfo.js';
import { compareAsc } from 'date-fns';
import { platform } from '../../platform/index.js';
import { IOError } from '../../errors.js';
import { fromSync } from '../effect/core.js';

const searchFunc = (
  parentDirectory: string,
  filterConditions: FileFilterInfo[],
  isRecursive: boolean = false,
): Effect.Effect<FileInfo[], IOError> =>
  Effect.gen(function* () {
    if (!platform.existsSync(parentDirectory)) {
      return [];
    }

    const dirents = yield* fromSync(
      IOError,
      `Fail to read dir ${parentDirectory}`,
    )(() => platform.readdirSync(parentDirectory, { withFileTypes: true }));

    const results: FileInfo[] = [];

    for (const dirent of dirents) {
      const fullPath = platform.join(
        platform.resolve(parentDirectory),
        dirent.name,
      );

      if (dirent.isFile()) {
        const [ok, fileInfo] = isFileValid(fullPath, filterConditions);
        if (ok) results.push(fileInfo);
      } else if (dirent.isDirectory() && isRecursive) {
        const childList = yield* searchFunc(
          fullPath,
          filterConditions,
          isRecursive,
        );
        results.push(...childList);
      }
    }

    return results;
  });

const isFileValid = (
  fileFullPath: string,
  filterConditions: FileFilterInfo[],
): [boolean, FileInfo] => {
  let isMatch = true;
  const fileInformation = new FileInfo(fileFullPath);

  if (!fileInformation.isFile) return [false, fileInformation];

  if (!filterConditions || filterConditions.length === 0)
    return [true, fileInformation];

  for (const filterInfo of filterConditions) {
    isMatch = isFileValidForFileter(fileInformation, filterInfo);
    if (!isMatch) break;
  }
  return [isMatch, fileInformation];
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
    ) => Effect.Effect<FileInfo[], IOError>;
  }
>()('FileSearchService', {
  make: Effect.succeed({
    search: searchFunc,
  }),
}) {
  static readonly live = Layer.effect(this, this.make);
}
