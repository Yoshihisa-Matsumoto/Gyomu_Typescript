import { Configurator } from './configurator';
import {
  FileArchiveType,
  FileCompareType,
  FileFilterInfo,
  FileInfo,
  FileTransportInfo,
  FilterType,
} from './fileModel';
import { compareAsc } from 'date-fns';
import { ResultAsync,errAsync, ok, okAsync} from './result';
import { AccessError, ArchiveError, TimeoutError } from './errors';
import { ZipArchive } from './archive/zip';
import { TarArchive } from './archive/tar';
import { isEqual } from 'date-fns';
import { GzipArchive } from './archive/gz';
import { polling } from './timer';
import { platform } from './platform';

export class FileOperation {
  static canAccess(
    fileName: string,
    readOnly: boolean = false
  ): ResultAsync<boolean, AccessError> {
    if (!platform.existsSync(fileName))
        return errAsync(new AccessError(`File Not exist: ${fileName}`));
    const specialExtension = ['xls', 'xlsm', 'xlsx', 'zip'];
    const stat = platform.statSync(fileName);

    if (
      specialExtension.includes(platform.extname(fileName)) &&
      stat.size === 0
    )
      return errAsync(new AccessError(`File is invalid: ${fileName}`));
    if (readOnly) return okAsync(true);
    
    return ResultAsync.fromPromise(
      (async () => {
        await new Promise(resolve => setTimeout(resolve, 100));

        const stat2 = platform.statSync(fileName);
        if (
          !isEqual(stat.ctime, stat2.ctime) ||
          !isEqual(stat.mtime, stat2.mtime)
        ) {
          throw new AccessError(`File is under operation: ${fileName}`);
        }

        return true;
      })(),
      e =>
        e instanceof AccessError
          ? e
          : new AccessError(`File check failed: ${fileName}`, e)
    );

    // try {
    //   const fileHandle = platform.openSync(
    //     fileName,
    //     readOnly ? 'r' : 'r+',
    //     readOnly
    //       ? platform.constants.O_RDONLY
    //       : platform.constants.O_RDWR | platform.constants.O_EXCL
    //   );
    //   platform.closeSync(fileHandle);
    //   return true;
    // } catch (err) {
    //   return false;
    // }
  }

  static waitTillExclusiveAccess(
    fileName: string,
    timeoutSeconds: number
  ): ResultAsync<boolean, TimeoutError> {
    return polling<AccessError>(
      `File Access check ${fileName}`,
      timeoutSeconds,
      0.5,
      (_): ResultAsync<boolean, AccessError> => {
        const accessible = this.canAccess(fileName, false);
        return accessible.orElse((_)=>okAsync(false));
      },
      fileName
    ).mapErr((error) => new TimeoutError(`Timeout on waiting file access: ${fileName}`, error));


  }

  static search(
    parentDirectory: string,
    filterConditions: FileFilterInfo[],
    isRecursive: boolean = false
  ): FileInfo[] {
    const fileInfoList = new Array<FileInfo>();
    if (!platform.existsSync(parentDirectory)) return fileInfoList;

    platform
      .readdirSync(parentDirectory, { withFileTypes: true })
      .forEach((dirent) => {
        if (dirent.isFile()) {
          const fullPath = platform.join(
            platform.resolve(parentDirectory),
            dirent.name
          );
          const [result, fileInfo] = this.#isFileValid(
            fullPath,
            filterConditions
          );
          if (result) {
            fileInfoList.push(fileInfo);
          }
        } else if (dirent.isDirectory()) {
          const fullPath = platform.join(
            platform.resolve(parentDirectory),
            dirent.name
          );
          const childInfoList = FileOperation.search(
            fullPath,
            filterConditions,
            isRecursive
          );
          fileInfoList.push(...childInfoList);
        }
        // const fullPath = platform.join(platform.resolve(parentDirectory), file);
        // console.log(fullPath);
        // const [result, fileInfo] = this.#isFileValid(fullPath, filterConditions);
        // if (result) fileInfoList.push(fileInfo);
        // if (!fileInfo.isFile && isRecursive) {
        //   const childInfoList = FileOperation.search(
        //     fileInfo.directoryPath,
        //     filterConditions,
        //     isRecursive
        //   );
        //   fileInfoList.push(...childInfoList);
        // }
      });
    return fileInfoList;
  }

  static #isFileValid(
    fileFullPath: string,
    filterConditions: FileFilterInfo[]
  ): [boolean, FileInfo] {
    let isMatch = true;
    const fileInformation = new FileInfo(fileFullPath);

    if (!fileInformation.isFile) return [false, fileInformation];

    if (!filterConditions || filterConditions.length === 0)
      return [true, fileInformation];

    for (const filterInfo of filterConditions) {
      isMatch = this.#isFileValidForFileter(fileInformation, filterInfo);
      if (!isMatch) break;
    }
    return [isMatch, fileInformation];
  }
  static #isFileValidForFileter(
    fileInformation: FileInfo,
    filterInformation: FileFilterInfo
  ): boolean {
    switch (filterInformation.kind) {
      case FilterType.FileName:
        return this.#isFileNameMatch(
          fileInformation.fileName,
          filterInformation.nameFilter,
          filterInformation.operator
        );
      case FilterType.CreateTime:
        return this.#isFileDateMatch(
          fileInformation.createTime,
          filterInformation.targetDate,
          filterInformation.operator
        );
      case FilterType.LastAccessTime:
        return this.#isFileDateMatch(
          fileInformation.lastAccessTime,
          filterInformation.targetDate,
          filterInformation.operator
        );
      case FilterType.LastModifiedTime:
        return this.#isFileDateMatch(
          fileInformation.updateTime,
          filterInformation.targetDate,
          filterInformation.operator
        );
    }
  }
  static #isFileNameMatch(
    fileName: string,
    targetFilter: string,
    compareType: FileCompareType
  ): boolean {
    switch (compareType) {
      case FileCompareType.Equal:
        const match = fileName.match(targetFilter);
        return !!match && match.length > 0;
      case FileCompareType.Larger:
        return fileName > targetFilter;
      case FileCompareType.LargerOrEqual:
        return fileName >= targetFilter;
      case FileCompareType.Less:
        return fileName < targetFilter;
      case FileCompareType.LessOrEqual:
        return fileName <= targetFilter;
    }
  }
  static #isFileDateMatch(
    fileDate: Date,
    targetFilter: Date,
    compareType: FileCompareType
  ): boolean {
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
  }

  static archive(
    archiveFileName: string,
    archiveType: FileArchiveType,
    sourceFileList: FileTransportInfo[],
    config: Configurator,
    applicationId: number,
    password: string = ''
  ): ResultAsync<boolean, ArchiveError> {
    if (!sourceFileList || sourceFileList.length === 0)
      return errAsync(new ArchiveError('Source File Not Specified to archive'));

    const archiveInformation = new FileInfo(archiveFileName);
    if (archiveType == FileArchiveType.GuessFromFileName) {
      const extension = archiveInformation.extension.toLowerCase();
      switch (extension) {
        case 'zip':
          archiveType = FileArchiveType.Zip;
          break;
        case 'tgz':
          archiveType = FileArchiveType.Tgz;
          break;
        case 'bz2':
          archiveType = FileArchiveType.BZip2;
          break;
        case 'gz':
          archiveType = FileArchiveType.GZip;
          break;
        case 'tar':
          archiveType = FileArchiveType.Tar;
          break;
        default:
          return errAsync(
            new ArchiveError('File Extension Not supported for archiving ' + extension)
          );
      }
    }
    if (
      archiveType == FileArchiveType.BZip2 ||
      archiveType == FileArchiveType.GZip
    ) {
      if (sourceFileList.length > 1 || sourceFileList[0].isSourceDirectory)
        return errAsync(
          new ArchiveError('Multiple files are not supported in this compression type: ' +
            archiveType)
        );
    }

    if (archiveType !== FileArchiveType.Zip && password !== '')
      return errAsync(
        new ArchiveError('password is not supported on other than zip format')
      );
    if (
      archiveType === FileArchiveType.Tar ||
      archiveType === FileArchiveType.Tgz
    ) {
      if (sourceFileList.length > 1 || !sourceFileList[0].isSourceDirectory)
        return errAsync(
          new ArchiveError('single file or multiple directory is not supported in this compression type: ' +
            archiveType)
        );
    }

    switch (archiveType) {
      case FileArchiveType.Zip:
        return ZipArchive.create(
          archiveInformation.fullPath,
          sourceFileList,
          password
        );
      case FileArchiveType.Tar:
        return TarArchive.create(
          archiveInformation.fullPath,
          sourceFileList[0]
        );
      case FileArchiveType.GZip:
        return GzipArchive.create(
          archiveInformation.fullPath,
          sourceFileList[0].sourceFullName
        );
      case FileArchiveType.Tgz:
        return TarArchive.create(
          archiveInformation.fullPath,
          sourceFileList[0],
          true
        );
    }

    return okAsync(true);
  }
}
