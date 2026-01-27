import { FileTransportInfo } from '../fileModel';

import { ArchiveError } from '../errors';
//import { fail, Result, success, PromiseResult, Failure } from '../result';
import {ResultAsync,errAsync, okAsync} from '../result';
import JSZip from 'jszip';
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
  static create(
    zipFileName: string,
    transferInformationList: FileTransportInfo[],
    password: string = ''
  ): ResultAsync<boolean, ArchiveError> {
    if (password) {
      return errAsync(
      new ArchiveError('Password protected zip creation is not supported')
    );
    }
    const zip = new JSZip();

    const addDirectory = (fsPath: string, relativeTo: string):ResultAsync<void, ArchiveError> => 
      ResultAsync.fromPromise(
        (async () => {
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
        })(),
        (e) => new ArchiveError('Fail to add directory', e as Error)
      );
    // transferInformation を直列処理
    const processTransfers = transferInformationList.reduce(
      (acc, info) =>
        acc.andThen(() => {
          const sourcePath = info.sourceFullNameWithBasePath;

          if (!platform.existsSync(sourcePath)) {
            return errAsync(
              new ArchiveError(`File Not Found: ${sourcePath}`)
            );
          }

          if (!info.isSourceDirectory) {
            const destinationEntryName =
              info.destinationFullName.replace(platform.sep, '/');
            zip.file(destinationEntryName, platform.readFileSync(sourcePath));
            return okAsync(undefined);
          }

          const destRoot = info.destinationPath
            ? info.destinationPath.replace(platform.sep, '/')
            : '';

          return addDirectory(sourcePath, destRoot);
        }),
      okAsync<void, ArchiveError>(undefined)
    );
    
    // ZIP生成 + 書き込み
    return processTransfers
    .andThen(() =>
      ResultAsync.fromPromise(
        zip.generateAsync({
          type: 'nodebuffer',
          compression: 'DEFLATE',
        }),
        (e) => new ArchiveError('Fail to zip archive', e as Error)
      )
    )
    .andThen((buffer) =>
      ResultAsync.fromPromise(
        platform.writeFile(zipFileName, buffer),
        (e) => new ArchiveError('Fail to write zip file', e as Error)
      )
    )
    .andThen(() =>
      ResultAsync.fromPromise(
        FileOperation.waitTillExclusiveAccess(zipFileName, 1),
        (e) => new ArchiveError('Fail to get exclusive access', e as Error)
      )
    )
    .map(() => true);
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

  fileExists(fileName: string): ResultAsync<boolean, ArchiveError> {
    fileName = this.__massageEntryPath(fileName);
    return ResultAsync.fromSafePromise(new Promise((resolve, reject) => {
      return unzipper.Open.file(this.archiveFileName)
        .then((directory) => {
          const targetFile = directory.files.find((f) => {
            return (
              f.type === 'File' &&
              this.#massageFileEntryFullPath(f) === fileName
            );
          });
          return resolve((!!targetFile));
        })
        .catch((err: Error) => {
          return reject(
              new ArchiveError(
                `Fail to check file existence of ${this.archiveFileName}->${fileName}`,
                err
              )
          );
        });
    }));
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
  extractSingileFile(
    sourceEntryFullName: string,
    destinationFullName: string
  ): ResultAsync<boolean, ArchiveError> {

    if (this.password) {
      return errAsync(
        new ArchiveError(
          'Password protected zip extraction is not supported'
        )
      );
    }

    const targetEntryName =
      this.__massageEntryPath(sourceEntryFullName);

    // ① zip ファイルを開く
    return ResultAsync.fromPromise(
      unzipper.Open.file(this.archiveFileName),
      (e) => new ArchiveError('Fail to open zip file', e as Error)
    )
      // ② 対象ファイル検索
      .andThen((directory) => {
        const targetFile = directory.files.find(
          (f) =>
            f.type === 'File' &&
            this.#massageFileEntryFullPath(f) === targetEntryName
        );

        if (!targetFile) {
          return errAsync(
            new ArchiveError(`File not found :${targetEntryName}`)
          );
        }

        return okAsync(targetFile);
      })
      // ③ 書き出し（stream → Promise → ResultAsync）
      .andThen((targetFile) => {
        this.__createDirectoryFromFileNameIfNotExist(
          destinationFullName
        );

        return ResultAsync.fromPromise(
          new Promise<void>((resolve, reject) => {
            targetFile
              .stream()
              .pipe(platform.createWriteStream(destinationFullName))
              .on('error', (err) => {
                reject(
                  new ArchiveError(
                    `Unknown Error on extract ${this.#massageFileEntryFullPath(
                      targetFile
                    )}`,
                    err
                  )
                );
              })
              .on('finish', () => {
                resolve();
              });
          }),
          (e) =>
            e instanceof ArchiveError
              ? e
              : new ArchiveError(
                  'Fail to extract file',
                  e as Error
                )
        );
      })
      // ④ 最終結果
      .map(() => true);
  }
extractDirectory(
  sourceDirectory: string,
  destinationDirectory: string
): ResultAsync<boolean, ArchiveError> {

  if (this.password) {
    return errAsync(
      new ArchiveError(
        'Password protected zip extraction is not supported'
      )
    );
  }

  const targetEntryName =
    this.__massageEntryPath(sourceDirectory);

  // ① zip を開く
  return ResultAsync.fromPromise(
    unzipper.Open.file(this.archiveFileName),
    (e) => new ArchiveError('Fail to open zip file', e as Error)
  )
    // ② 対象エントリ抽出
    .andThen((directory) => {
      const targetFileList = directory.files.filter((f) =>
        this.#massageFileEntryFullPath(f).startsWith(targetEntryName)
      );

      if (targetFileList.length === 0) {
        return errAsync(
          new ArchiveError(`Folder not found : ${targetEntryName}`)
        );
      }

      this.__createDirectoryIfNotExist(destinationDirectory);

      // ディレクトリ作成（同期）
      targetFileList
        .filter((f) => f.type === 'Directory')
        .forEach((file) => {
          const entryFullPath =
            this.#massageFileEntryFullPath(file);
          const destinationPath = platform.join(
            destinationDirectory,
            entryFullPath
              .substring(targetEntryName.length)
              .replace('/', platform.sep)
          );
          this.__createDirectoryFromFileNameIfNotExist(destinationPath);
        });

      return okAsync(
        targetFileList.filter((f) => f.type === 'File')
      );
    })
    // ③ ファイル展開（並列）
    .andThen((files) =>
      ResultAsync.combine(
        files.map((file) => {
          const entryFullPath =
            this.#massageFileEntryFullPath(file);
          const destinationPath = platform.join(
            destinationDirectory,
            entryFullPath
              .substring(targetEntryName.length)
              .replace('/', platform.sep)
          );

          this.__createDirectoryFromFileNameIfNotExist(destinationPath);

          return ResultAsync.fromPromise(
            new Promise<void>((resolve, reject) => {
              file
                .stream()
                .pipe(platform.createWriteStream(destinationPath))
                .on('error', (err) =>
                  reject(
                    new ArchiveError(
                      `Error on unarchive ${entryFullPath}`,
                      err
                    )
                  )
                )
                .on('finish', resolve);
            }),
            (e) =>
              e instanceof ArchiveError
                ? e
                : new ArchiveError(
                    `Error on unarchive ${entryFullPath}`,
                    e as Error
                  )
          );
        })
      )
    )
    // ④ 最終結果
    .map(() => true);
}
  extractAll(
    destinationDirectory: string
  ): ResultAsync<boolean, ArchiveError> {
    return this.extractDirectory('', destinationDirectory);
  }
  extract(
    //zipFilename: string,
    transferInformation: FileTransportInfo
  ): ResultAsync<boolean, ArchiveError> {
    //console.log('directory', directory);
    // const targetEntryName = this.__massageEntryPath(
    //   transferInformation.sourceFullName
    // );
    //console.log('targetEntryName:', targetEntryName, ':');

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
