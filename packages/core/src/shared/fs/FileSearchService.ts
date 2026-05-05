import { Effect, Context, FileSystem } from 'effect';
import { FileFilterInfo } from '../../gyomu/file/filter.js';
import { IOError } from '../../errors.js';
import { FileInfo } from '../../gyomu/file/index.js';

export class FileSearchService extends Context.Service<
  FileSearchService,
  {
    search: (
      parentDirectory: string,
      filterConditions: FileFilterInfo[],
      isRecursive?: boolean,
    ) => Effect.Effect<FileInfo[], IOError, FileSystem.FileSystem>;
  }
>()('FileSearchService') {}
