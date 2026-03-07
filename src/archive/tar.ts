import { FileTransportInfo } from '../fileModel';

import {
  runAsync,
  GyomuResultAsync,
  simpleErrAsync,
  okAsync,
  toPromiseFromEmitter,
} from '../result';

import { create, list, extract } from 'tar';
import { AbstractBaseArchive } from './abstract';
import { IOError } from '../errors';

/**
 * @remarks
 * This class (extract side) doesn't support stream based retrieval yet
 */
export class TarArchive extends AbstractBaseArchive {
  static create(
    tarFileName: string,
    transferInformation: FileTransportInfo,
    needGZipCompression: boolean = false,
  ): GyomuResultAsync<boolean> {
    // const currentDirectory = path.dirname(
    //   transferInformation.sourceFullNameWithBasePath,
    // );
    // const targetPathForTar =
    //   transferInformation.sourceFullNameWithBasePath.substring(
    //     currentDirectory.length + path.sep.length,
    //   );
    // console.log('current', currentDirectory);
    // console.log('target', targetPathForTar);
    if (!transferInformation.isSourceDirectory) {
      return simpleErrAsync(IOError, 'Single File is not supported');
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
    return runAsync(
      () =>
        new Promise((resolve, reject) => {
          let result: Promise<void>;
          if (!needGZipCompression) {
            result = create(
              {
                file: tarFileName,
                cwd: transferInformation.sourceFullNameWithBasePath,
              },
              [''],
            );
          } else {
            result = create(
              {
                file: tarFileName,
                cwd: transferInformation.sourceFullNameWithBasePath,
                gzip: true,
              },
              [''],
            );
          }

          result
            .then(() => {
              return resolve(true);
            })
            .catch((err: Error) => {
              return reject(new IOError('Fail to Tar archive', err));
            });
        }),
      IOError,
      'Fail to archive as tar',
    );
  }
  constructor(tarFilename: string) {
    super(tarFilename);
  }

  fileExists(fileName: string): GyomuResultAsync<boolean> {
    fileName = this.__massageEntryPath(fileName);

    let isExist = false;
    return runAsync(
      () => {
        return toPromiseFromEmitter(
          list({
            file: this.archiveFileName,
            onentry: (entry) => {
              if (entry.path === fileName) isExist = true;
            },
          }),
        );
        // const result = list({
        //   file: this.archiveFileName,
        //   onentry: (entry) => {
        //     if (entry.path === fileName) isExist = true;
        //   },
        // });
        // if (result instanceof Promise) {
        //   return result;
        // }
        // return new Promise<void>((resolve, reject) => {
        //   result.on('end', () => resolve);
        //   result.on('error', reject);
        // });
      },
      IOError,
      'Fail to list tar archive',
    ).andThen(() => okAsync(isExist));
  }

  extractSingileFile(
    sourceEntryFullName: string,
    destinationFolderName: string,
  ): GyomuResultAsync<boolean> {
    const targetEntryName = this.__massageEntryPath(sourceEntryFullName);
    const numPathElementToSkip = (targetEntryName.match(/\//g) || []).length;
    this.__createDirectoryIfNotExist(destinationFolderName);
    return runAsync(
      () => {
        return toPromiseFromEmitter(
          extract({
            cwd: destinationFolderName,
            file: this.archiveFileName,
            filter: (path) => path === targetEntryName,
            strip: numPathElementToSkip,
          }),
        );
        // if (result instanceof Promise) {
        //   return result;
        // }
        // return new Promise<void>((resolve, reject) => {
        //   result.on('end', () => resolve);
        //   result.on('error', reject);
        // });
      },
      IOError,
      `Fail to untar ${this.archiveFileName} -> ${targetEntryName}`,
    ).andThen(() => okAsync(true));
  }

  extractDirectory(
    sourceDirectory: string,
    destinationDirectory: string,
  ): GyomuResultAsync<boolean> {
    const targetEntryName = this.__massageEntryPath(sourceDirectory);
    const numPathElementToSkip = !sourceDirectory
      ? 0
      : (targetEntryName.match(/\//g) || []).length + 1;

    //let directoryName = path.dirname(destinationDirectory);
    this.__createDirectoryIfNotExist(destinationDirectory);
    return runAsync(
      () => {
        return toPromiseFromEmitter(
          extract({
            cwd: destinationDirectory,
            file: this.archiveFileName,
            filter: (path) =>
              !targetEntryName || path.startsWith(targetEntryName),
            strip: numPathElementToSkip,
          }),
        );
      },
      IOError,
      `Fail to untar ${this.archiveFileName} -> ${targetEntryName}`,
    ).andThen(() => okAsync(true));
  }

  extractAll(destinationDirectory: string): GyomuResultAsync<boolean> {
    return this.extractDirectory('', destinationDirectory);
  }
  extract(transferInformation: FileTransportInfo): GyomuResultAsync<boolean> {
    //console.log('directory', directory);
    // const targetEntryName = this.__massageEntryPath(
    //   transferInformation.sourceFullName,
    // );
    if (
      transferInformation.sourceFileName !==
      transferInformation.destinationFileName
    )
      return simpleErrAsync(
        IOError,
        'Destination filename must be same as original filename',
      );
    //console.log('targetEntryName:', targetEntryName, ':');

    //const directory = await unzipper.Open.file(this.zipFilename);

    if (!transferInformation.isSourceDirectory) {
      return this.extractSingileFile(
        transferInformation.sourceFullName,
        transferInformation.destinationPath,
      );
    } else {
      return this.extractDirectory(
        transferInformation.sourceFullName,
        transferInformation.destinationFullName,
      );
    }
  }
}
