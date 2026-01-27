import { FileTransportInfo } from '../fileModel';

import { ArchiveError } from '../errors';
//import { fail, Result, success, PromiseResult, Failure } from '../result';
import {ResultAsync,errAsync, okAsync} from '../result';
// import tarStream from 'tar-stream';
// import tar from 'tar-fs';
import * as tar from 'tar';
import { AbstractBaseArchive } from './abstract';

/**
 * @remarks
 * This class (extract side) doesn't support stream based retrieval yet
 */
export class TarArchive extends AbstractBaseArchive {
  static create(
    tarFileName: string,
    transferInformation: FileTransportInfo,
    needGZipCompression: boolean = false
  ): ResultAsync<boolean, ArchiveError> {
    // let currentDirectory = path.dirname(
    //   transferInformation.sourceFullNameWithBasePath
    // );
    // let targetPathForTar =
    //   transferInformation.sourceFullNameWithBasePath.substring(
    //     currentDirectory.length + path.sep.length
    //   );
    // console.log('current', currentDirectory);
    // console.log('target', targetPathForTar);
    if (!transferInformation.isSourceDirectory) {
      return errAsync(new ArchiveError('Single File is not supported'));
    }
    // let tarOptions: tar.CreateOptions & tar.FileOptions;
    // tarOptions = {
    //   file: tarFileName,
    //   cwd: transferInformation.sourceFullNameWithBasePath,
    // };
    // if (needGZipCompression) {
    //   tarOptions = {
    //     file: tarFileName,
    //     cwd: transferInformation.sourceFullNameWithBasePath,
    //     gzip: true,
    //   };
    // }
    return ResultAsync.fromSafePromise(new Promise((resolve, reject) => {
      let result: Promise<void>;
      if (!needGZipCompression) {
        result = tar.create(
          {
            file: tarFileName,
            cwd: transferInformation.sourceFullNameWithBasePath,
          },
          ['']
        );
      } else {
        result = tar.create(
          {
            file: tarFileName,
            cwd: transferInformation.sourceFullNameWithBasePath,
            gzip: true,
          },
          ['']
        );
      }

      result
        .then(() => {
          return resolve(true);
        })
        .catch((err: Error) => {
          return reject(new ArchiveError('Fail to Tar archive',err));
        });
    }));
  }
  constructor(tarFilename: string) {
    super(tarFilename);
  }

  fileExists(fileName: string): ResultAsync<boolean, ArchiveError> {
    fileName = this.__massageEntryPath(fileName);

    let isExist = false;
    return ResultAsync.fromPromise(tar.list({
      file: this.archiveFileName,
      onentry: (entry) => {
        if (entry.path === fileName) isExist = true;
      },
    }),(e)=>new ArchiveError('Fail to list tar archive'))
    .andThen(()=>okAsync(isExist));
  }

  extractSingileFile(
    sourceEntryFullName: string,
    destinationFolderName: string
  ): ResultAsync<boolean, ArchiveError> {
    const targetEntryName = this.__massageEntryPath(sourceEntryFullName);
    const numPathElementToSkip = (targetEntryName.match(/\//g) || []).length;
    this.__createDirectoryIfNotExist(destinationFolderName);
    return ResultAsync.fromSafePromise(new Promise(async (resolve, reject) => {
      await tar
        .extract({
          cwd: destinationFolderName,
          file: this.archiveFileName,
          filter: (path, stat) => {
            return path === targetEntryName;
          },
          strip: numPathElementToSkip,
        })
        .then(() => {
          return resolve(true);
        })
        .catch((reason: Error) => {
          return reject(
              new ArchiveError(
                `Fail to untar ${this.archiveFileName} -> ${targetEntryName}`,
                reason
              )
            
          );
        });
    }));
  }

  extractDirectory(
    sourceDirectory: string,
    destinationDirectory: string
  ): ResultAsync<boolean, ArchiveError> {
    const targetEntryName = this.__massageEntryPath(sourceDirectory);
    const numPathElementToSkip = !sourceDirectory
      ? 0
      : (targetEntryName.match(/\//g) || []).length + 1;

    //let directoryName = path.dirname(destinationDirectory);
    this.__createDirectoryIfNotExist(destinationDirectory);
    return ResultAsync.fromSafePromise( new Promise(async (resolve, reject) => {
      await tar
        .extract({
          cwd: destinationDirectory,
          file: this.archiveFileName,
          filter: (path, _) => {
            return !targetEntryName || path.startsWith(targetEntryName);
          },
          strip: numPathElementToSkip,
        })
        .then(() => {
          resolve(true);
        })
        .catch((reason: Error) => {
          reject(
            new ArchiveError(
              `Fail to untar ${this.archiveFileName} -> ${targetEntryName}`,
              reason
            )
          );
        });
    }));
  }


  extractAll(
    destinationDirectory: string
  ): ResultAsync<boolean, ArchiveError> {
    return this.extractDirectory('', destinationDirectory);
  }
  extract(
    transferInformation: FileTransportInfo
  ): ResultAsync<boolean, ArchiveError> {
    //console.log('directory', directory);
    // const targetEntryName = this.__massageEntryPath(
    //   transferInformation.sourceFullName
    // );
    if (
      transferInformation.sourceFileName !==
      transferInformation.destinationFileName
    )
      return errAsync(new ArchiveError(
        'Destination filename must be same as original filename'
      ));
    //console.log('targetEntryName:', targetEntryName, ':');

    //const directory = await unzipper.Open.file(this.zipFilename);

    if (!transferInformation.isSourceDirectory) {
      return this.extractSingileFile(
        transferInformation.sourceFullName,
        transferInformation.destinationPath
      );
    } else {
      return this.extractDirectory(
        transferInformation.sourceFullName,
        transferInformation.destinationFullName
      );
    }
  }
}
