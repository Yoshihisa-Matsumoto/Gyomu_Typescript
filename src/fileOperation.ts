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
import { fail, PromiseResult, Result, success } from './result';
import { AccessError, ArchiveError, TimeoutError } from './errors';
import { fi } from 'date-fns/locale';
import { ZipArchive } from './archive/zip';
import { TarArchive } from './archive/tar';
import { isEqual } from 'date-fns';
import { GzipArchive } from './archive/gz';
import { polling } from './timer';
import { platform } from './platform';

export class FileOperation {
  static async canAccess(
    fileName: string,
    readOnly: boolean = false
  ): PromiseResult<boolean, AccessError> {
    return new Promise(async (resolve, reject) => {
      if (!platform.existsSync(fileName))
        return resolve(fail(`File Not exist: ${fileName}`, AccessError));
      const specialExtension = ['xls', 'xlsm', 'xlsx', 'zip'];
      const stat = platform.statSync(fileName);

      if (
        specialExtension.includes(platform.extname(fileName)) &&
        stat.size === 0
      )
        return resolve(fail(`File is invalid: ${fileName}`, AccessError));
      if (readOnly) return resolve(success(true));
      await setTimeout(() => {
        const stat2 = platform.statSync(fileName);
        if (
          !isEqual(stat.ctime, stat2.ctime) ||
          !isEqual(stat.mtime, stat2.mtime)
        ) {
          // console.log(stat.ctime, stat2.ctime);
          // console.log(stat.mtime, stat2.mtime);
          return resolve(
            fail(`File is under operation: ${fileName}`, AccessError)
          );
        }
        //console.log('Accessible', stat2.mtime);
        return resolve(success(true));
      }, 100);

      return false;
    });

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

  static async waitTillExclusiveAccess(
    fileName: string,
    timeoutSeconds: number
  ): PromiseResult<boolean, TimeoutError> {
    return await polling<AccessError>(
      `File Access check ${fileName}`,
      timeoutSeconds,
      0.5,
      async (fileName) => {
        const accessible = await this.canAccess(fileName, false);
        if (accessible.isSuccess()) {
          //console.log('accessible', accessible.value);
          return success(accessible.value);
        } else return success(false);
      },
      fileName
    );

    // const timeoutTime = new Date().getTime() + timeoutSeconds * 1000;
    // const nextIntervalMilliSecond = 500;

    // const accessible = await this.canAccess(fileName, false);
    // if (accessible.isSuccess() && accessible.value) {
    //   return success(accessible.value);
    // }
    // if (new Date().getTime() > timeoutTime) {
    //   return fail(`Timeout happen to access ${fileName}`, TimeoutError);
    // }

    // return new Promise(async (resolve, reject) => {
    //   const timerId = await setInterval(async () => {
    //     const accessible = await this.canAccess(fileName, false);
    //     if (accessible.isSuccess() && accessible.value) {
    //       clearInterval(timerId);
    //       return resolve(success(accessible.value));
    //     }
    //     if (new Date().getTime() > timeoutTime) {
    //       //console.log('Timeout');
    //       clearInterval(timerId);
    //       return resolve(
    //         fail(`Timeout happen to access ${fileName}`, TimeoutError)
    //       );
    //     }
    //     //console.log('wait next', new Date().getTime(), timeoutTime);
    //   }, nextIntervalMilliSecond);
    // });
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

    for (var filterInfo of filterConditions) {
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

  static async archive(
    archiveFileName: string,
    archiveType: FileArchiveType,
    sourceFileList: FileTransportInfo[],
    config: Configurator,
    applicationId: number,
    password: string = ''
  ): Promise<Result<boolean, ArchiveError>> {
    if (!sourceFileList || sourceFileList.length === 0)
      return fail('Source File Not Specified to archive', ArchiveError);

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
          return fail(
            'File Extension Not supported for archiving ' + extension,
            ArchiveError
          );
      }
    }
    if (
      archiveType == FileArchiveType.BZip2 ||
      archiveType == FileArchiveType.GZip
    ) {
      if (sourceFileList.length > 1 || sourceFileList[0].isSourceDirectory)
        return fail(
          'Multiple files are not supported in this compression type: ' +
            archiveType,
          ArchiveError
        );
    }

    if (archiveType !== FileArchiveType.Zip && password !== '')
      return fail(
        'password is not supported on other than zip format',
        ArchiveError
      );
    if (
      archiveType === FileArchiveType.Tar ||
      archiveType === FileArchiveType.Tgz
    ) {
      if (sourceFileList.length > 1 || !sourceFileList[0].isSourceDirectory)
        return fail(
          'single file or multiple directory is not supported in this compression type: ' +
            archiveType,
          ArchiveError
        );
    }

    switch (archiveType) {
      case FileArchiveType.Zip:
        return await ZipArchive.create(
          archiveInformation.fullPath,
          sourceFileList,
          password
        );
      case FileArchiveType.Tar:
        return await TarArchive.create(
          archiveInformation.fullPath,
          sourceFileList[0]
        );
      case FileArchiveType.GZip:
        return await GzipArchive.create(
          archiveInformation.fullPath,
          sourceFileList[0].sourceFullName
        );
      case FileArchiveType.Tgz:
        return await TarArchive.create(
          archiveInformation.fullPath,
          sourceFileList[0],
          true
        );
    }

    return success(true);
  }
}
