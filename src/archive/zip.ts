import { FileTransportInfo } from '../fileModel';

import fs from 'fs';
import path, { resolve } from 'path';
import { ArchiveError } from '../errors';
import { fail, Result, success, PromiseResult, Failure } from '../result';
import archiver from 'archiver';
import unzipper, { Entry, File } from 'unzipper';
import stream from 'stream';
import il from 'iconv-lite';
/**
 * @remarks
 * This class (extract side) doesn't support stream based retrieval yet
 */
export class ZipArchive {
  static _initialize() {
    archiver.registerFormat('zip-encrypted', require('archiver-zip-encrypted'));
  }
  static async create(
    zipFileName: string,
    transferInformationList: FileTransportInfo[],
    password: string = ''
  ): Promise<Result<boolean, ArchiveError>> {
    const archive =
      password === ''
        ? archiver.create('zip', { forceZip64: true })
        : archiver.create('zip-encrypted', {
            forceZip64: true,
            encryptionMethod: 'aes256',
            password: '123',
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
    await archive.finalize();
    return success(true);
  }

  readonly zipFilename: string;
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
    this.zipFilename = zipFilename;
    this.password = password;
    this.isAesEncrypted = isAesEncrypted;
    this.encoding = encoding;
  }

  #massageEntryPath(fileName: string) {
    return fileName.replace(/\\/g, '/');
  }
  async fileExists(fileName: string) {
    fileName = this.#massageEntryPath(fileName);
    return unzipper.Open.file(this.zipFilename).then((directory) => {
      const targetFile = directory.files.find((f) => {
        return (
          f.type === 'File' && this.#massageFileEntryFullPath(f) === fileName
        );
      });
      return !!targetFile;
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
  #createDirectoryFromFileNameIfNotExist(destinationFilename: string) {
    let directoryName = path.dirname(destinationFilename);

    if (destinationFilename.endsWith(path.sep))
      directoryName = destinationFilename;
    return this.#createDirectoryIfNotExist(directoryName);
  }
  #createDirectoryIfNotExist(destinationPath: string) {
    let directoryName = destinationPath;

    if (!fs.existsSync(directoryName)) {
      console.log(directoryName + ' to be created');
      fs.mkdirSync(directoryName);
    }
  }
  async extractSingileFile(
    sourceEntryFullName: string,
    destinationFullName: string
  ): PromiseResult<boolean, ArchiveError> {
    const targetEntryName = this.#massageEntryPath(sourceEntryFullName);
    return unzipper.Open.file(this.zipFilename).then((directory) => {
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

      this.#createDirectoryFromFileNameIfNotExist(destinationFullName);
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
    const targetEntryName = this.#massageEntryPath(sourceDirectory);
    const result = unzipper.Open.file(this.zipFilename).then(
      async (directory) => {
        const targetFileList = directory.files.filter((f) =>
          this.#massageFileEntryFullPath(f).startsWith(targetEntryName)
        );
        if (!targetFileList || targetFileList.length === 0) {
          return fail(`Folder not found : ${targetEntryName}`, ArchiveError);
        }
        this.#createDirectoryIfNotExist(destinationDirectory);
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
            this.#createDirectoryFromFileNameIfNotExist(destinationPath);
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
            this.#createDirectoryFromFileNameIfNotExist(destinationPath);

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
  async extractAll(destinationDirectory: string) {
    return this.extractDirectory('', destinationDirectory);
  }
  async extract(
    //zipFilename: string,
    transferInformation: FileTransportInfo
  ) {
    //console.log('directory', directory);
    const targetEntryName = this.#massageEntryPath(
      transferInformation.sourceFullName
    );
    console.log('targetEntryName:', targetEntryName, ':');

    //const directory = await unzipper.Open.file(this.zipFilename);

    if (!transferInformation.isSourceDirectory) {
      return this.extractSingileFile(
        transferInformation.sourceFullName,
        transferInformation.destinationFullName
      );
    } else {
      return this.extractDirectory(
        transferInformation.sourceFullName,
        transferInformation.destinationFullName
      );
    }
  }
}

ZipArchive._initialize();
