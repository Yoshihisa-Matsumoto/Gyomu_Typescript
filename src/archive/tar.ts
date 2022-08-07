import { FileTransportInfo } from '../fileModel';

import fs from 'fs';
import path, { resolve } from 'path';
import { ArchiveError } from '../errors';
import { fail, Result, success, PromiseResult, Failure } from '../result';
import archiver from 'archiver';
// import tarStream from 'tar-stream';
// import tar from 'tar-fs';
import tar from 'tar';
import { AbstractBaseArchive } from './abstract';

/**
 * @remarks
 * This class (extract side) doesn't support stream based retrieval yet
 */
export class TarArchive extends AbstractBaseArchive {
  // static async create(
  //   tarFileName: string,
  //   transferInformationList: FileTransportInfo[]
  // ): Promise<Result<boolean, ArchiveError>> {
  //   const archive = archiver.create('tar');

  //   //outputStream.on('close',()=>)
  //   archive.on('warning', (err) => {
  //     if (err.code === 'ENOENT') {
  //       console.log(err.message);
  //     } else {
  //       return new Failure(
  //         new ArchiveError('Unknown Warning on Tar Archive', err)
  //       );
  //     }
  //   });
  //   archive.on('error', (err) => {
  //     return new Failure(new ArchiveError('Unknown Error on Tar Archive', err));
  //   });
  //   const outputStream = fs.createWriteStream(tarFileName);
  //   archive.pipe(outputStream);

  //   for (const transferInformation of transferInformationList) {
  //     const sourcePath = transferInformation.sourceFullNameWithBasePath;
  //     if (!fs.existsSync(sourcePath))
  //       return fail(`File Not Found: ${sourcePath}`, ArchiveError);
  //     if (!transferInformation.isSourceDirectory) {
  //       let destinationEntryName =
  //         transferInformation.destinationFullName.replace(path.sep, '/');
  //       archive.file(sourcePath, { name: destinationEntryName });
  //     } else {
  //       archive.directory(
  //         sourcePath,
  //         transferInformation.destinationPath
  //           ? transferInformation.destinationPath
  //           : false
  //       );
  //       //this.#buildZipArchiveInternal(sourcePath, sourcePath, archive);
  //     }
  //   }
  //   await archive.finalize();
  //   return success(true);
  // }
  // static async create(
  //   tarFileName: string,
  //   transferInformation: FileTransportInfo
  // ): PromiseResult<boolean, ArchiveError> {
  //   let rootPack: tarStream.Pack;

  //   const sourcePath = transferInformation.sourceFullNameWithBasePath;
  //   if (!fs.existsSync(sourcePath))
  //     return fail(`File Not Found: ${sourcePath}`, ArchiveError);
  //   if (!transferInformation.isSourceDirectory)
  //     return fail('Single File packing is not supported now', ArchiveError);

  //   let destinationEntryName = transferInformation.destinationFullName.replace(
  //     path.sep,
  //     '/'
  //   );

  //   rootPack = tar.pack(sourcePath);

  //   return new Promise((resolve, reject) => {
  //     rootPack
  //       .pipe(fs.createWriteStream(tarFileName))
  //       .on('error', (err) => {
  //         return resolve(
  //           new Failure(
  //             new ArchiveError(`Unknown Error on create ${tarFileName}`, err)
  //           )
  //         );
  //       })
  //       .on('finish', () => {
  //         resolve(success(true));
  //       });
  //   });
  // }

  static async create(
    tarFileName: string,
    transferInformation: FileTransportInfo
  ): PromiseResult<boolean, ArchiveError> {
    let currentDirectory = path.dirname(
      transferInformation.sourceFullNameWithBasePath
    );
    let targetPathForTar =
      transferInformation.sourceFullNameWithBasePath.substring(
        currentDirectory.length + path.sep.length
      );
    // console.log('current', currentDirectory);
    // console.log('target', targetPathForTar);
    if (!transferInformation.isSourceDirectory) {
      return fail('Single File is not supported', ArchiveError);
    }
    return new Promise((resolve, reject) => {
      tar
        .create(
          {
            file: tarFileName,
            cwd: transferInformation.sourceFullNameWithBasePath,
          },
          ['']
        )
        .then(() => {
          return resolve(success(true));
        })
        .catch((err: Error) => {
          return resolve(fail('Fail to Tar archive', ArchiveError));
        });
    });
  }
  constructor(tarFilename: string) {
    super(tarFilename);
  }

  async fileExists(fileName: string): PromiseResult<boolean, ArchiveError> {
    fileName = this.__massageEntryPath(fileName);

    let isExist = false;
    const extract = await tar.list({
      file: this.archiveFileName,
      onentry: (entry) => {
        if (entry.header.path === fileName) isExist = true;
      },
    });
    return success(isExist);
  }

  async extractSingileFile(
    sourceEntryFullName: string,
    destinationFolderName: string
  ): PromiseResult<boolean, ArchiveError> {
    const targetEntryName = this.__massageEntryPath(sourceEntryFullName);
    const numPathElementToSkip = (targetEntryName.match(/\//g) || []).length;
    this.__createDirectoryIfNotExist(destinationFolderName);
    return new Promise(async (resolve, reject) => {
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
          return resolve(success(true));
        })
        .catch((reason: Error) => {
          return resolve(
            new Failure(
              new ArchiveError(
                `Fail to untar ${this.archiveFileName} -> ${targetEntryName}`,
                reason
              )
            )
          );
        });
    });
  }

  async extractDirectory(
    sourceDirectory: string,
    destinationDirectory: string
  ): PromiseResult<boolean, ArchiveError> {
    const targetEntryName = this.__massageEntryPath(sourceDirectory);
    const numPathElementToSkip = !sourceDirectory
      ? 0
      : (targetEntryName.match(/\//g) || []).length + 1;

    //let directoryName = path.dirname(destinationDirectory);
    this.__createDirectoryIfNotExist(destinationDirectory);
    return new Promise(async (resolve, reject) => {
      await tar
        .extract({
          cwd: destinationDirectory,
          file: this.archiveFileName,
          filter: (path, stat) => {
            return !targetEntryName || path.startsWith(targetEntryName);
          },
          strip: numPathElementToSkip,
        })
        .then(() => {
          return resolve(success(true));
        })
        .catch((reason: Error) => {
          return resolve(
            new Failure(
              new ArchiveError(
                `Fail to untar ${this.archiveFileName} -> ${targetEntryName}`,
                reason
              )
            )
          );
        });
    });
  }

  async extractAll(
    destinationDirectory: string
  ): PromiseResult<boolean, ArchiveError> {
    return this.extractDirectory('', destinationDirectory);
  }
  async extract(
    transferInformation: FileTransportInfo
  ): PromiseResult<boolean, ArchiveError> {
    //console.log('directory', directory);
    const targetEntryName = this.__massageEntryPath(
      transferInformation.sourceFullName
    );
    if (
      transferInformation.sourceFileName !==
      transferInformation.destinationFileName
    )
      return fail(
        'Destination filename must be same as original filename',
        ArchiveError
      );
    //console.log('targetEntryName:', targetEntryName, ':');

    //const directory = await unzipper.Open.file(this.zipFilename);

    if (!transferInformation.isSourceDirectory) {
      return await this.extractSingileFile(
        transferInformation.sourceFullName,
        transferInformation.destinationPath
      );
    } else {
      return await this.extractDirectory(
        transferInformation.sourceFullName,
        transferInformation.destinationFullName
      );
    }
  }
}
