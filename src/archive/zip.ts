import { FileTransportInfo } from '../fileModel';

import fs from 'fs';
import path, { resolve } from 'path';
import { ArchiveError } from '../errors';
import { fail, Result, success, PromiseResult, Failure } from '../result';
import archiver from 'archiver';
import unzipper, { Entry, File } from 'unzipper';
import stream from 'stream';
import il from 'iconv-lite';
import { AbstractBaseArchive } from './abstract';
import { FileOperation } from '../fileOperation';
/**
 * @remarks
 * This class (extract side) doesn't support stream based retrieval yet
 * This class  doesn't support AES decryption yet
 */
export class ZipArchive extends AbstractBaseArchive {
  static _initialize() {
    archiver.registerFormat('zip-encrypted', require('archiver-zip-encrypted'));
  }
  static async create(
    zipFileName: string,
    transferInformationList: FileTransportInfo[],
    password: string = ''
  ): PromiseResult<boolean, ArchiveError> {
    const archive =
      password === ''
        ? archiver.create('zip', { forceZip64: true })
        : archiver.create('zip-encrypted', {
            forceZip64: true,
            encryptionMethod: 'zip20',
            password,
          });

    //outputStream.on('close',()=>)
    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.log(err.message);
      } else {
        return new Failure(new ArchiveError('Unknown Warning on Archive', err));
      }
    });
    archive.on('error', (err) => {
      return new Failure(new ArchiveError('Unknown Error on Archive', err));
    });
    archive.on('close', () => {
      //console.log('close');
    });
    archive.on('end', function () {
      //console.log('Data has been drained');
    });
    archive.on('finish', function () {
      //console.log('finish');
    });
    const outputStream = fs.createWriteStream(zipFileName);
    archive.pipe(outputStream);

    for (const transferInformation of transferInformationList) {
      const sourcePath = transferInformation.sourceFullNameWithBasePath;
      if (!fs.existsSync(sourcePath))
        return fail(`File Not Found: ${sourcePath}`, ArchiveError);
      if (!transferInformation.isSourceDirectory) {
        let destinationEntryName =
          transferInformation.destinationFullName.replace(path.sep, '/');
        archive.file(sourcePath, { name: destinationEntryName });
      } else {
        archive.directory(
          sourcePath,
          transferInformation.destinationPath
            ? transferInformation.destinationPath
            : false
        );
        //this.#buildZipArchiveInternal(sourcePath, sourcePath, archive);
      }
    }
    return new Promise(async (resolve, reject) => {
      await archive
        .finalize()
        .then(async () => {
          if (!!password) {
            await FileOperation.waitTillExclusiveAccess(zipFileName, 1);
          }
          return resolve(success(true));
        })
        .catch((err: Error) => {
          return resolve(
            new Failure(new ArchiveError('Fail to zip archive', err))
          );
        });
      // console.log('final');
      return resolve(success(true));
    });
  }

  readonly password: string;
  readonly isAesEncrypted: boolean;
  readonly encoding: string;
  constructor({
    zipFilename,
    password = '',
    encoding = '',
    isAesEncrypted = false,
  }: {
    zipFilename: string;
    password?: string;
    encoding?: string;
    isAesEncrypted?: boolean;
  }) {
    super(zipFilename);
    this.password = password;
    this.isAesEncrypted = isAesEncrypted;
    this.encoding = encoding;
  }

  async fileExists(fileName: string): PromiseResult<boolean, ArchiveError> {
    fileName = this.__massageEntryPath(fileName);
    return new Promise((resolve, reject) => {
      return unzipper.Open.file(this.archiveFileName)
        .then((directory) => {
          const targetFile = directory.files.find((f) => {
            return (
              f.type === 'File' &&
              this.#massageFileEntryFullPath(f) === fileName
            );
          });
          return resolve(success(!!targetFile));
        })
        .catch((err: Error) => {
          return resolve(
            new Failure(
              new ArchiveError(
                `Fail to check file existence of ${this.archiveFileName}->${fileName}`,
                err
              )
            )
          );
        });
    });
  }
  #unicode: number = 0x800;
  #massageFileEntryFullPath(file: File) {
    if (
      !this.encoding ||
      (!!file.flags && (file.flags & this.#unicode) !== 0)
    ) {
      return file.path;
    }
    const decoded = il.decode(file.pathBuffer, this.encoding);
    // console.log(decoded);
    return decoded;
  }
  // #createDirectoryFromFileNameIfNotExist(destinationFilename: string) {
  //   let directoryName = path.dirname(destinationFilename);

  //   if (destinationFilename.endsWith(path.sep))
  //     directoryName = destinationFilename;
  //   return this.#createDirectoryIfNotExist(directoryName);
  // }
  // #createDirectoryIfNotExist(destinationPath: string) {
  //   let directoryName = destinationPath;

  //   if (!fs.existsSync(directoryName)) {
  //     console.log(directoryName + ' to be created');
  //     fs.mkdirSync(directoryName);
  //   }
  // }
  async extractSingileFile(
    sourceEntryFullName: string,
    destinationFullName: string
  ): PromiseResult<boolean, ArchiveError> {
    const targetEntryName = this.__massageEntryPath(sourceEntryFullName);
    return unzipper.Open.file(this.archiveFileName).then((directory) => {
      const targetFile = directory.files.find((f) => {
        return (
          f.type === 'File' &&
          this.#massageFileEntryFullPath(f) === targetEntryName
        );
      });
      if (!targetFile) {
        console.log(`File not found :${targetEntryName}`);
        return fail(`File not found :${targetEntryName}`, ArchiveError);
      }

      this.__createDirectoryFromFileNameIfNotExist(destinationFullName);
      return new Promise((resolve, reject) => {
        targetFile
          .stream(this.password)
          .pipe(fs.createWriteStream(destinationFullName))
          .on('error', (err) => {
            return resolve(
              new Failure(
                new ArchiveError(
                  `Unknown Error on extract ${this.#massageFileEntryFullPath(
                    targetFile
                  )}`,
                  err
                )
              )
            );
          })
          .on('finish', () => {
            resolve(success(true));
          });
      });
    });
  }
  async extractDirectory(
    sourceDirectory: string,
    destinationDirectory: string
  ): PromiseResult<boolean, ArchiveError> {
    const targetEntryName = this.__massageEntryPath(sourceDirectory);
    const result = unzipper.Open.file(this.archiveFileName).then(
      async (directory) => {
        const targetFileList = directory.files.filter((f) =>
          this.#massageFileEntryFullPath(f).startsWith(targetEntryName)
        );
        if (!targetFileList || targetFileList.length === 0) {
          return fail(`Folder not found : ${targetEntryName}`, ArchiveError);
        }
        this.__createDirectoryIfNotExist(destinationDirectory);
        targetFileList
          .filter((file) => file.type === 'Directory')
          .forEach((file) => {
            const entryFullPath = this.#massageFileEntryFullPath(file);
            let destinationPath = path.join(
              destinationDirectory,
              entryFullPath
                .substring(targetEntryName.length)
                .replace('/', path.sep)
            );
            this.__createDirectoryFromFileNameIfNotExist(destinationPath);
          });
        const resultPromiseList = await targetFileList
          .filter((file) => file.type === 'File')
          .map(async (file) => {
            const entryFullPath = this.#massageFileEntryFullPath(file);
            let destinationPath = path.join(
              destinationDirectory,
              entryFullPath
                .substring(targetEntryName.length)
                .replace('/', path.sep)
            );
            this.__createDirectoryFromFileNameIfNotExist(destinationPath);

            return new Promise<void>((resolve, reject) => {
              file
                .stream(this.password)
                .pipe(fs.createWriteStream(destinationPath))
                .on('error', (err) => {
                  reject({
                    err: err,
                    fileName: this.#massageFileEntryFullPath(file),
                  });
                })
                .on('finish', resolve);
            });
          });
        const result = await Promise.all(resultPromiseList)
          .then((results) => {
            //return new Promise<void>((resolve,reject)=>{resolve();})
            return success(true);
          })
          .catch((reason: { err: Error; fileName: string }) => {
            return new Failure(
              new ArchiveError(
                `Error on unarchive ${reason.fileName}`,
                reason.err
              )
            );
          });
        return result;
      }
    );
    return result;
  }
  async extractAll(
    destinationDirectory: string
  ): PromiseResult<boolean, ArchiveError> {
    return this.extractDirectory('', destinationDirectory);
  }
  async extract(
    //zipFilename: string,
    transferInformation: FileTransportInfo
  ): PromiseResult<boolean, ArchiveError> {
    //console.log('directory', directory);
    const targetEntryName = this.__massageEntryPath(
      transferInformation.sourceFullName
    );
    //console.log('targetEntryName:', targetEntryName, ':');

    //const directory = await unzipper.Open.file(this.zipFilename);

    if (!transferInformation.isSourceDirectory) {
      return await this.extractSingileFile(
        transferInformation.sourceFullName,
        transferInformation.destinationFullName
      );
    } else {
      return await this.extractDirectory(
        transferInformation.sourceFullName,
        transferInformation.destinationFullName
      );
    }
  }
}

ZipArchive._initialize();
