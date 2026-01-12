import { FileTransportInfo } from '../fileModel';

import { ArchiveError } from '../errors';
import { fail, Result, success, PromiseResult, Failure } from '../result';
const JSZip = require('jszip');
import unzipper, { File } from 'unzipper';
import il from 'iconv-lite';
import { AbstractBaseArchive } from './abstract';
import { FileOperation } from '../fileOperation';
import { platform } from '../platform';
/**
 * @remarks
 * This class (extract side) doesn't support stream based retrieval yet
 * This class  doesn't support AES decryption yet
 */
export class ZipArchive extends AbstractBaseArchive {
  static async create(
    zipFileName: string,
    transferInformationList: FileTransportInfo[],
    password: string = ''
  ): PromiseResult<boolean, ArchiveError> {
    if (!!password) {
      return fail(
        'Password protected zip creation is not supported',
        ArchiveError
      );
    }
    const zip = new JSZip();

    for (const transferInformation of transferInformationList) {
      const sourcePath = transferInformation.sourceFullNameWithBasePath;
      if (!platform.existsSync(sourcePath))
        return fail(`File Not Found: ${sourcePath}`, ArchiveError);
      if (!transferInformation.isSourceDirectory) {
        let destinationEntryName =
          transferInformation.destinationFullName.replace(platform.sep, '/');
        zip.file(destinationEntryName, platform.readFileSync(sourcePath));
      } else {
        const destRoot = transferInformation.destinationPath
          ? transferInformation.destinationPath.replace(platform.sep, '/')
          : '';
        const addDirectory = async (fsPath: string, relativeTo: string) => {
          const items = platform.readdirSync(fsPath, { withFileTypes: true });
          for (const item of items) {
            const itemPath = platform.join(fsPath, item.name);
            const zipPath = (relativeTo ? relativeTo + '/' : '') + item.name;
            if (item.isDirectory()) {
              zip.folder(zipPath);
              await addDirectory(itemPath, zipPath);
            } else if (item.isFile()) {
              zip.file(zipPath, platform.readFileSync(itemPath));
            }
          }
        };
        await addDirectory(sourcePath, destRoot);
        //this.#buildZipArchiveInternal(sourcePath, sourcePath, archive);
      }
    }
    try {
      const buffer = await zip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
      });
      await platform.writeFile(zipFileName, buffer);
      await FileOperation.waitTillExclusiveAccess(zipFileName, 1);
      return success(true);
    } catch (err) {
      return new Failure(new ArchiveError('Fail to zip archive', err as Error));
    }
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
  //   let directoryName = platform.dirname(destinationFilename);

  //   if (destinationFilename.endsWith(platform.sep))
  //     directoryName = destinationFilename;
  //   return this.#createDirectoryIfNotExist(directoryName);
  // }
  // #createDirectoryIfNotExist(destinationPath: string) {
  //   let directoryName = destinationPath;

  //   if (!platform.existsSync(directoryName)) {
  //     console.log(directoryName + ' to be created');
  //     platform.mkdirSync(directoryName);
  //   }
  // }
  async extractSingileFile(
    sourceEntryFullName: string,
    destinationFullName: string
  ): PromiseResult<boolean, ArchiveError> {
    if (!!this.password)
      return fail(
        'Password protected zip extraction is not supported',
        ArchiveError
      );
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
          .stream()
          .pipe(platform.createWriteStream(destinationFullName))
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
    if (!!this.password)
      return fail(
        'Password protected zip extraction is not supported',
        ArchiveError
      );
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
            let destinationPath = platform.join(
              destinationDirectory,
              entryFullPath
                .substring(targetEntryName.length)
                .replace('/', platform.sep)
            );
            this.__createDirectoryFromFileNameIfNotExist(destinationPath);
          });
        const resultPromiseList = await targetFileList
          .filter((file) => file.type === 'File')
          .map(async (file) => {
            const entryFullPath = this.#massageFileEntryFullPath(file);
            let destinationPath = platform.join(
              destinationDirectory,
              entryFullPath
                .substring(targetEntryName.length)
                .replace('/', platform.sep)
            );
            this.__createDirectoryFromFileNameIfNotExist(destinationPath);

            return new Promise<void>((resolve, reject) => {
              file
                .stream()
                .pipe(platform.createWriteStream(destinationPath))
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
