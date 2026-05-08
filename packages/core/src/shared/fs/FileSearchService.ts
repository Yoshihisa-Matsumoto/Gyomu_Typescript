import { Effect, Context, FileSystem } from 'effect';
import { IOError } from '../../error/IOError.js';
import { FileFilterInfo } from '../../gyomu/file/filter.js';
import { FileInfo } from '../../gyomu/file/types.js';

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
