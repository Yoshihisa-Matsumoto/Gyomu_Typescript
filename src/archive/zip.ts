import { FileTransportInfo } from '../fileModel';
// import fse, { remove } from 'fs-extra';
// import fs from 'fs';
import { platform } from '../platform';
//import path from 'path';
import {
  allResultsOk,
  GyomuResultAsync,
  errAsync,
  okAsync,
  result2Async,
  simpleErrAsync,
  runAsync,
  run,
  ensure,
} from '../result';
//import archiver from 'archiver';
import JSZip from 'jszip';
import { Open, File, Parse, CentralDirectory } from 'unzipper';

import { AbstractBaseArchive } from './abstract';
import { FileOperation } from '../fileOperation';
import { logger } from '../logger';
//import { Z_PARTIAL_FLUSH } from 'zlib';
import { FileInput, IOError, toReadable } from '..';
import { PassThrough } from 'stream';
//import os from 'os';
import { spawnSync } from 'child_process';
import { Json2Csv } from '../csv.js';
import { DiffDetail } from '../reconcile';
import { decode } from '../encoding/decode';

type CopyOptions = {
  overwrite?: boolean;
};
const unicode_flag: number = 0x800;
/**
 * @remarks
 * This class (extract side) doesn't support stream based retrieval yet
 * This class  doesn't support AES decryption yet
 */
export class ZipArchive extends AbstractBaseArchive {
  // static {
  //   archiver.registerFormat('zip-encrypted', require('archiver-zip-encrypted'));
  // }
  static create(
    zipFileName: string,
    transferInformationList: FileTransportInfo[],
  ): GyomuResultAsync<boolean> {
    const zip = new JSZip();
    const addDirectory = (
      fsPath: string,
      relativeTo: string,
    ): GyomuResultAsync<void> =>
      runAsync(
        async () => {
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
        },
        IOError,
        'Fail to add directory',
      );
    // transferInformation を直列処理
    const initial: GyomuResultAsync<void> = okAsync(undefined);
    const processTransfers = transferInformationList.reduce(
      (acc, info) =>
        acc.andThen(() => {
          const sourcePath = info.sourceFullNameWithBasePath;

          if (!platform.existsSync(sourcePath)) {
            return errAsync(new IOError(`File Not Found: ${sourcePath}`));
          }

          if (!info.isSourceDirectory) {
            const destinationEntryName = info.destinationFullName.replace(
              platform.sep,
              '/',
            );
            zip.file(destinationEntryName, platform.readFileSync(sourcePath));
            return okAsync(undefined);
          }

          const destRoot = info.destinationPath
            ? info.destinationPath.replace(platform.sep, '/')
            : '';

          return addDirectory(sourcePath, destRoot);
        }),
      initial,
    );

    // ZIP生成 + 書き込み
    return processTransfers
      .andThen(() =>
        runAsync(
          () =>
            zip.generateAsync({
              type: 'nodebuffer',
              compression: 'DEFLATE',
            }),
          IOError,
          'Fail to zip archive',
        ),
      )
      .andThen((buffer) =>
        runAsync(
          () => platform.writeFile(zipFileName, buffer),
          IOError,
          'Fail to write zip file',
        ),
      )
      .andThen(() => FileOperation.waitTillExclusiveAccess(zipFileName, 1))
      .map(() => true);
    // for (const transferInformation of transferInformationList) {
    //   const sourcePath = transferInformation.sourceFullNameWithBasePath;
    //   if (!platform.existsSync(sourcePath))
    //     return simpleErrAsync(IOError,`File Not Found: ${sourcePath}`);
    //   if (!transferInformation.isSourceDirectory) {
    //     const destinationEntryName =
    //       transferInformation.destinationFullName.replace(platform.sep, '/');
    //     //archive.file(sourcePath, { name: destinationEntryName });
    //     zip.file(destinationEntryName, platform.readFileSync(sourcePath));
    //   } else {
    //     const files = await listFileRecursive(sourcePath);
    //     for (const fullPath of files) {
    //       const relativePath = platform
    //         .relative(transferInformation.basePath ?? sourcePath, fullPath)
    //         .split(platform.sep)
    //         .join('/');
    //       const zipPath = relativePath;

    //       const content = await platform.readFileSync(fullPath);
    //       zip.file(zipPath, content);
    //     }
    //     // archive.directory(
    //     //   sourcePath,
    //     //   transferInformation.destinationPath
    //     //     ? transferInformation.destinationPath
    //     //     : false,
    //     // );
    //     //this.#buildZipArchiveInternal(sourcePath, sourcePath, archive);
    //   }
    // }
    // // const resultPromise: PromiseResult<boolean> = new Promise(
    // //   async (resolve) => {
    // //     await archive
    // //       .finalize()
    // //       .then(async () => {
    // //         if (password) {
    // //           await FileOperation.waitTillExclusiveAccess(zipFileName, 1);
    // //         }
    // //         return resolve(success(true));
    // //       })
    // //       .catch((err: Error) => {
    // //         return resolve(new Failure(new Error('Fail to zip archive', err)));
    // //       });
    // //     // console.log('final');
    // //     return resolve(success(true));
    // //   },
    // // );
    // const zipBuffer = await zip.generateAsync({
    //   type: 'nodebuffer',
    //   compression: 'DEFLATE',
    //   compressionOptions: { level: 6 },
    // });
    // await platform.writeFile(zipFileName, zipBuffer);

    // const waitResult = await FileOperation.waitTillExclusiveAccess(
    //   zipFileName,
    //   2,
    // );
    // if (waitResult.isFailure()) return waitResult;

    // return waitResult;
  }

  static mergeZipToNew(
    sourceFileNames: string[],
    mergeNewFilename: string,
    laterFilePrioritized: boolean = false,
  ): GyomuResultAsync<boolean> {
    const zipC = new JSZip();
    return runAsync(
      async () => {
        for (const sourceFilename of sourceFileNames) {
          const srcData = await platform.readFile(sourceFilename);
          const srcZip = await JSZip.loadAsync(srcData);
          await this.#copyZip(srcZip, zipC, {
            overwrite: laterFilePrioritized,
          });
        }

        const zipBuffer = await zipC.generateAsync({
          type: 'nodebuffer',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 },
        });
        return platform.writeFile(mergeNewFilename, zipBuffer);
      },
      IOError,
      'Fail to merge zip files',
    )
      .andThen(() => FileOperation.waitTillExclusiveAccess(mergeNewFilename, 2))
      .map(() => true);
  }

  static async #copyZip(from: JSZip, to: JSZip, options: CopyOptions = {}) {
    const { overwrite = false } = options;

    for (const [path, file] of Object.entries(from.files)) {
      if (!overwrite && to.files[path]) continue;
      else {
        const content = await file.async('nodebuffer');
        to.file(path, content);
      }
    }
  }

  readonly password: string;
  readonly isAesEncrypted: boolean;
  readonly encoding: string;
  constructor({
    zipFilename,
    zipContentBuffer,
    password = '',
    encoding = '',
    isAesEncrypted = false,
  }: {
    zipFilename?: string;
    zipContentBuffer?: Buffer;
    password?: string;
    encoding?: string;
    isAesEncrypted?: boolean;
  }) {
    super(zipFilename, zipContentBuffer);
    this.password = password;
    this.isAesEncrypted = isAesEncrypted;
    this.encoding = encoding;
  }

  #getZip() {
    return runAsync(
      async () => {
        if (this.archiveFileName) {
          return Open.file(this.archiveFileName);
        } else {
          return Open.buffer(this.archiveContent as Buffer);
        }
      },
      IOError,
      'fail to get zip dictionary',
    );
  }
  fileExists(fileName: string): GyomuResultAsync<boolean> {
    return this.#getFileEntry(fileName, true).map((fileEntry) => !!fileEntry);
  }
  #massageFileEntryFullPath(file: File) {
    return massageFileEntryFullPath(file, this.encoding);
  }
  #extractSingleFileEntry(file: File, destinationFullName: string) {
    return extractSingleFile(file, destinationFullName, this.encoding);
  }
  #getFileEntry(
    targetEntryName: string,
    returnFalseWhenNotExist: boolean = false,
  ) {
    targetEntryName = this.__massageEntryPath(targetEntryName);
    return this.#getZip().andThen((directory) =>
      runAsync(
        async () => {
          const targetFile = directory.files.find((f) => {
            return (
              f.type === 'File' &&
              this.#massageFileEntryFullPath(f) === targetEntryName
            );
          });
          if (!targetFile) {
            if (returnFalseWhenNotExist) return false;
            logger.error(`File not found :${targetEntryName}`);
            throw new IOError(`File not found :${targetEntryName}`);
          }
          return targetFile;
        },
        IOError,
        'fail to get file entry',
      ),
    );
  }
  #getFileEntryThrowIfNotExist(targetEntryName: string) {
    return this.#getFileEntry(targetEntryName) as GyomuResultAsync<File>;
  }
  extractSingleFile2Buffer(
    sourceEntryFullName: string,
  ): GyomuResultAsync<Buffer<ArrayBufferLike>> {
    return this.#getFileEntryThrowIfNotExist(sourceEntryFullName).andThen(
      (file) =>
        runAsync(
          async () => {
            return await file.buffer();
          },
          IOError,
          `fail to extract file: ${sourceEntryFullName}`,
        ),
    );
  }

  extractSingleFile(
    sourceEntryFullName: string,
    destinationFullName: string,
  ): GyomuResultAsync<boolean> {
    const targetEntryName = this.__massageEntryPath(sourceEntryFullName);
    return this.#getFileEntryThrowIfNotExist(targetEntryName).andThen(
      (targetFile) =>
        runAsync(
          async () => {
            return this.#extractSingleFileEntry(
              targetFile,
              destinationFullName,
            );
          },
          IOError,
          `fail to extract file: ${sourceEntryFullName}`,
        ),
    );
  }
  extractDirectory(
    sourceDirectory: string,
    destinationDirectory: string,
  ): GyomuResultAsync<boolean> {
    const targetEntryName = this.__massageEntryPath(sourceDirectory);
    return (
      this.#getZip()
        .andThen((directory) => {
          const targetFileList = directory.files.filter((f) =>
            this.#massageFileEntryFullPath(f).startsWith(targetEntryName),
          );
          if (!targetFileList || targetFileList.length === 0) {
            return simpleErrAsync(
              IOError,
              `Folder not found : ${targetEntryName}`,
            );
          }
          this.__createDirectoryIfNotExist(destinationDirectory);
          targetFileList
            .filter((file) => file.type === 'Directory')
            .forEach((file) => {
              const entryFullPath = this.#massageFileEntryFullPath(file);
              const destinationPath = platform.join(
                destinationDirectory,
                entryFullPath
                  .substring(targetEntryName.length)
                  .replace('/', platform.sep),
              );
              this.__createDirectoryFromFileNameIfNotExist(destinationPath);
            });
          // ディレクトリ作成（同期）
          targetFileList
            .filter((f) => f.type === 'Directory')
            .forEach((file) => {
              const entryFullPath = this.#massageFileEntryFullPath(file);
              const destinationPath = platform.join(
                destinationDirectory,
                entryFullPath
                  .substring(targetEntryName.length)
                  .replace('/', platform.sep),
              );
              this.__createDirectoryFromFileNameIfNotExist(destinationPath);
            });

          return okAsync(targetFileList.filter((f) => f.type === 'File'));
        })
        // ③ ファイル展開（並列）
        .andThen((files) =>
          allResultsOk(
            files.map((file) => {
              const entryFullPath = this.#massageFileEntryFullPath(file);
              const destinationPath = platform.join(
                destinationDirectory,
                entryFullPath
                  .substring(targetEntryName.length)
                  .replace('/', platform.sep),
              );

              return runAsync(
                () => this.#extractSingleFileEntry(file, destinationPath),
                IOError,

                `Error on unarchive ${entryFullPath}`,
              );
            }),
          ),
        )
        // ④ 最終結果
        .map(() => true)
    );
  }
  extractAll(destinationDirectory: string): GyomuResultAsync<boolean> {
    return this.extractDirectory('', destinationDirectory);
  }
  extract(
    //zipFilename: string,
    transferInformation: FileTransportInfo,
  ): GyomuResultAsync<boolean> {
    //console.log('directory', directory);
    // const targetEntryName = this.__massageEntryPath(
    //   transferInformation.sourceFullName,
    // );
    //console.log('targetEntryName:', targetEntryName, ':');

    //const directory = await unzipper.Open.file(this.zipFilename);

    if (!transferInformation.isSourceDirectory) {
      return this.extractSingleFile(
        transferInformation.sourceFullName,
        transferInformation.destinationFullName,
      );
    } else {
      return this.extractDirectory(
        transferInformation.sourceFullName,
        transferInformation.destinationFullName,
      );
    }
  }
  static async retrieveCentralDirectories(zipFilename: string) {
    return await Open.file(zipFilename);
  }
  static async *fromZip(zip: FileInput, sourceEntryFullName: string) {
    const targetEntryName = sourceEntryFullName.replace(/\\/g, '/');
    const zipStream = toReadable(zip).pipe(Parse({ forceStream: true }));

    for await (const entry of zipStream) {
      if (entry.path !== targetEntryName) {
        entry.autodrain();
        continue;
      }
      yield {
        name: entry.path,
        stream: entry,
      };
    }
    return;
  }
}

const massageFileEntryFullPath = (file: File, encoding?: string) => {
  if (!encoding || (!!file.flags && (file.flags & unicode_flag) !== 0)) {
    return file.path;
  }
  const decoded = decode(file.pathBuffer, encoding);
  // console.log(decoded);
  return decoded;
};
const extractSingleFile = (
  targetFile: File,
  destinationFullName: string,
  encoding?: string,
) => {
  platform.createDirectoryFromFileNameIfNotExist(destinationFullName);
  return new Promise<boolean>((resolve, reject) => {
    targetFile
      .stream()
      .pipe(platform.createWriteStream(destinationFullName))
      .once('error', (err) => {
        reject(
          new IOError(
            `Unknown Error on extract ${massageFileEntryFullPath(
              targetFile,
              encoding,
            )} to ${destinationFullName}`,
            err,
          ),
        );
      })
      .once('finish', () => {
        resolve(true);
      });
  });
};

const extractSingleFileEntry = (
  targetFile: FileEntry,
  destinationFullName: string,
) => {
  platform.createDirectoryFromFileNameIfNotExist(destinationFullName);
  return new Promise<boolean>((resolve, reject) => {
    targetFile
      .stream()
      .pipe(platform.createWriteStream(destinationFullName))
      .once('error', (err) => {
        reject(new IOError(`Unknown Error on extract`, err));
      })
      .once('finish', () => {
        resolve(true);
      });
  });
};

// const listFileRecursive = async (dirPath: string): Promise<string[]> => {
//   const results: string[] = [];
//   const stat = await platform.stat(dirPath);
//   if (!stat.isDirectory()) throw new Error(`${dirPath} is not a directory`);
//   await __walk(dirPath, results);
//   return results;
// };
// const __walk = async (currentPath: string, results: string[]) => {
//   const entries = await platform.readdir(currentPath, {
//     withFileTypes: true,
//   });
//   for (const entry of entries) {
//     const fullPath = platform.join(currentPath, entry.name);
//     if (entry.isDirectory()) {
//       await __walk(fullPath, results);
//     } else if (entry.isFile()) {
//       results.push(fullPath);
//     } else if (entry.isSymbolicLink()) {
//       // 必要ならシンボリックリンクの解決やスキップの処理を追加
//       try {
//         const stats = await platform.stat(fullPath);
//         if (stats.isFile()) results.push(fullPath);
//       } catch {
//         // シンボリックリンクが壊れている等は無視
//       }
//     }
//   }
// };

export type DiffSummary = {
  path: string;
  diff: 'Only in Source' | 'Only in Destination' | 'Different';
};
// export type DiffDetail = {
//   path: string;
//   sourceValue: string;
//   destinationValue: string;
// };

const summaryFilename = '@summary.csv';
type ZipCompareOption = {
  sourceFilename: string;
  destinationFilename: string;
  resultPath: string;
  diffIgnoreRule?: IgnoreRule[];
  fileNameExcludeRule?: FileNameExclusionRule;
  includeOriginalFileInDiff?: boolean;
};

export type FileNameExclusionRule = {
  [path: string]: {
    type: 'include' | 'exclude';
    target?: string[];
    targetRegEx?: string[];
  }[];
};

type DiffernceIgnoreRule = {
  filePathRegExpression: string;
  type: 'Different';
  criteria: {
    pathRegExpression: string;
    sourceValue?: string;
    destinationValue?: string;
  }[];
};

type ExistInOnlyOnePartyIgnoreRule = {
  filePathRegExpression: string;
  type: 'Only in Source' | 'Only in Destination';
};

export type IgnoreRule = DiffernceIgnoreRule | ExistInOnlyOnePartyIgnoreRule;

export type FileEntry = {
  stream: (password?: string) => PassThrough;
  buffer: (password?: string) => Promise<Buffer>;
};

type DiffResult = {
  diff: DiffDetail[];
  diffExist: boolean;
};
type InterimOutputType = {
  sourceFiles: CentralDirectory;
  destinationFiles: CentralDirectory;
  results: DiffSummary[];
  promises: Promise<boolean>[];
};
export const compareZip = (
  option: ZipCompareOption,
  compareFunc?: (option: {
    source: FileEntry;
    destination: FileEntry;
    filePath: string;
    resultPath: string;
  }) => GyomuResultAsync<DiffResult>,
): GyomuResultAsync<DiffSummary[] | undefined> => {
  const { sourceFilename, destinationFilename, resultPath } = option;

  return result2Async(
    ensure(
      platform.existsSync(sourceFilename),
      IOError,
      `${sourceFilename} Not exist`,
    ),
  )
    .andThen(() =>
      ensure(
        platform.existsSync(destinationFilename),
        IOError,
        `${destinationFilename} Not exist`,
      ),
    )
    .andThen(() =>
      result2Async(
        run(
          () => {
            platform.removeSync(resultPath);
            platform.emptyDirSync(resultPath);
          },
          IOError,
          'fail to prepare files to compare',
        ).map(() => true),
      ),
    )
    .andThen(() =>
      runAsync(
        async () => {
          //状態初期化
          const interimOutput: InterimOutputType = {
            sourceFiles:
              await ZipArchive.retrieveCentralDirectories(sourceFilename),
            destinationFiles:
              await ZipArchive.retrieveCentralDirectories(destinationFilename),
            results: [],
            promises: [],
          };
          return interimOutput;
        },
        IOError,
        'fail to initialize interim output',
      ),
    )
    .andThen((interimOutput) => {
      //ソースファイルから比較するパターン
      return interimOutput.sourceFiles.files.reduce<
        GyomuResultAsync<InterimOutputType>
      >(
        (previousOutput, sourceFile) =>
          previousOutput.andThen(() => {
            if (
              option.fileNameExcludeRule &&
              isComparisionExcludeTarget(
                sourceFile.path.replaceAll('/', '\\'),
                option.fileNameExcludeRule,
                Object.keys(option.fileNameExcludeRule),
              )
            ) {
              //比較除外条件に入ったものは何もしない
              return previousOutput;
            }
            const destinationFile = interimOutput.destinationFiles.files.find(
              (f) => f.path === sourceFile.path && f.type === sourceFile.type,
            );
            if (destinationFile) {
              //File exist on both zip, need comparison
              return internalCompareFileEntry(
                sourceFile,
                destinationFile,
                interimOutput,
                option,
                compareFunc,
              );
            } else {
              //File exist only in source zip
              return handleMissingFileInComparison(
                sourceFile,
                true,
                interimOutput,
                option,
              );
            }
          }),
        okAsync(interimOutput),
      );
    })
    .andThen((interimOutput) => {
      //デスティネーションファイルから比較するパターン
      return interimOutput.destinationFiles.files.reduce<
        GyomuResultAsync<InterimOutputType>
      >(
        (previousOutput, destinationFile) =>
          previousOutput.andThen(() => {
            const sourceFile = interimOutput.sourceFiles.files.find(
              (f) =>
                f.path === destinationFile.path &&
                f.type === destinationFile.type,
            );
            if (sourceFile) return okAsync(interimOutput);
            if (
              option.fileNameExcludeRule &&
              isComparisionExcludeTarget(
                destinationFile.path.replaceAll('/', '\\'),
                option.fileNameExcludeRule,
                Object.keys(option.fileNameExcludeRule),
              )
            ) {
              return okAsync(interimOutput);
            }
            return handleMissingFileInComparison(
              destinationFile,
              false,
              interimOutput,
              option,
            );
          }),
        okAsync(interimOutput),
      );
    })
    .andThen((interimOutput) =>
      runAsync(
        async () => {
          const allPromiseResults = await Promise.allSettled<boolean>(
            interimOutput.promises,
          );
          const failedResult = allPromiseResults
            .filter((f) => f.status === 'rejected')
            .map((f) => f.reason);
          if (failedResult && failedResult.length > 0) {
            throw new IOError('Fail to compare zips', failedResult);
          }
          return interimOutput.results;
        },
        IOError,
        'Fail to finalize zip comparison',
      ),
    )
    .andThen((results) => {
      if (results.length == 0) return okAsync(undefined);

      results.sort((a, b) => {
        if (a.path < b.path) {
          return -1;
        } else if (a.path > b.path) {
          return 1;
        } else {
          return 0;
        }
      });
      return Json2Csv(results, {
        outputFilename: platform.join(resultPath, summaryFilename),
        bom: true,
        quoted: true,
      }).map(() => results);
    });
};

const internalCompareFileEntry = (
  sourceFile: File,
  destinationFile: File,
  interimOutput: InterimOutputType,
  option: ZipCompareOption,
  compareFunc?: (option: {
    source: FileEntry;
    destination: FileEntry;
    filePath: string;
    resultPath: string;
  }) => GyomuResultAsync<DiffResult>,
) => {
  const { resultPath, diffIgnoreRule } = option;
  const { results, promises } = interimOutput;
  let targetIgnoreRule: IgnoreRule | undefined = undefined;
  if (
    sourceFile.uncompressedSize === destinationFile.uncompressedSize &&
    sourceFile.crc32 === destinationFile.crc32
  ) {
    //Exact Same Content
    return okAsync(interimOutput);
  }

  //Something changed
  let diffSummaryRecord: DiffSummary | undefined = {
    path: sourceFile.path,
    diff: 'Different',
  };
  if (diffIgnoreRule) {
    targetIgnoreRule = diffIgnoreRule.find(
      (r) =>
        r.type === 'Different' &&
        new RegExp(r.filePathRegExpression).test(sourceFile.path),
    );
  }
  return okAsync(true)
    .andThen(() => {
      if (!compareFunc) return okAsync(interimOutput);
      return compareFunc({
        source: sourceFile,
        destination: destinationFile,
        filePath: sourceFile.path.replaceAll('/', '\\'),
        resultPath,
      })
        .andThen((diffResult) => {
          let diffDetailList = diffResult.diff;
          const originalNumberOfDiff = diffDetailList.length;
          if (targetIgnoreRule) {
            const targetDiffIgnoreRule =
              targetIgnoreRule as DiffernceIgnoreRule;
            if (!targetDiffIgnoreRule.criteria) {
              diffDetailList = [];
            } else {
              const diffResultTobeDeleted: DiffDetail[] = [];
              for (const diff of diffDetailList) {
                if (
                  targetDiffIgnoreRule.criteria.find((c) => {
                    return (
                      new RegExp(c.pathRegExpression).test(diff.path) &&
                      (!c.sourceValue || c.sourceValue === diff.sourceValue) &&
                      (!c.destinationValue ||
                        c.destinationValue === diff.destinationValue)
                    );
                  })
                ) {
                  diffResultTobeDeleted.push(diff);
                }
              }
              for (const diff of diffResultTobeDeleted) {
                diffDetailList.splice(diffDetailList.indexOf(diff), 1);
              }
            }
          }
          return okAsync({ diffResult, diffDetailList, originalNumberOfDiff });
        })
        .andThen(({ diffResult, diffDetailList, originalNumberOfDiff }) => {
          if (
            (originalNumberOfDiff == 0 && diffResult.diffExist) ||
            diffDetailList.length > 5 ||
            diffDetailList.find(
              (d) =>
                d.sourceValue.length > 100 || d.destinationValue.length > 100,
            )
          ) {
            //Diff is small and generate git diff and include in the summary
            return compareTextfile(
              sourceFile,
              destinationFile,
              sourceFile.path.replaceAll('/', '\\'),
              resultPath,
            ).map(() => {
              return { diffResult, diffDetailList, originalNumberOfDiff };
            });
          }
          return okAsync({ diffResult, diffDetailList, originalNumberOfDiff });
        })
        .andThen(({ diffResult, diffDetailList, originalNumberOfDiff }) => {
          if (diffDetailList.length > 0) {
            diffDetailList.sort((a, b) => {
              if (a.path < b.path) {
                return -1;
              } else if (a.path > b.path) {
                return 1;
              } else {
                return 0;
              }
            });
            const filePath =
              platform.join(resultPath, sourceFile.path.replaceAll('/', '\\')) +
              '.diff.csv';
            const pathName = platform.dirname(filePath);
            platform.ensureDirSync(pathName);
            return Json2Csv(diffDetailList, {
              outputFilename: filePath,
              bom: true,
              quoted: true,
            }).map(() => {
              return true;
            });
          }
          if (diffDetailList.length === 0 && originalNumberOfDiff > 0) {
            diffSummaryRecord = undefined;
          }
          if (diffDetailList.length === 0 && diffResult.diffExist == false) {
            diffSummaryRecord = undefined;
          }
          return okAsync(true);
        });
    })
    .andThen(() => {
      if (diffSummaryRecord) {
        results.push(diffSummaryRecord);
        if (option.includeOriginalFileInDiff) {
          const sourcePath = platform.join(
            resultPath,
            sourceFile.path.replaceAll('/', '\\') + '.source',
          );
          if (sourceFile.type == 'File') {
            promises.push(extractSingleFile(sourceFile, sourcePath));
          }

          const destinationPath = platform.join(
            resultPath,
            destinationFile.path.replaceAll('/', '\\') + '.destination',
          );
          promises.push(extractSingleFile(destinationFile, destinationPath));
        }
      }
      return okAsync(interimOutput);
    });
};
const handleMissingFileInComparison = (
  existingFile: File,
  isSourceExist: boolean,
  interimOutput: InterimOutputType,
  option: ZipCompareOption,
) => {
  const { results, promises } = interimOutput;
  const { resultPath, diffIgnoreRule } = option;
  const existingPart = isSourceExist ? 'Source' : 'Destination';

  let targetIgnoreRule: IgnoreRule | undefined = undefined;
  //Destination File Not Exist
  if (diffIgnoreRule) {
    targetIgnoreRule = diffIgnoreRule.find(
      (r) =>
        r.type === `Only in ${existingPart}` &&
        new RegExp(r.filePathRegExpression).test(existingFile.path),
    );
  }
  if (!targetIgnoreRule) {
    if (existingFile.type != 'File') return okAsync(interimOutput);
    results.push({ path: existingFile.path, diff: `Only in ${existingPart}` });
    const filePath = platform.join(
      resultPath,
      existingFile.path.replaceAll('/', '\\'),
    );
    promises.push(extractSingleFile(existingFile, filePath));
  }
  return okAsync(interimOutput);
};
const gitTempPath = platform.join(platform.tmpdir(), 'gitCompareTemp');
const compareTextfile = (
  source: FileEntry,
  destination: FileEntry,
  filePath: string,
  resultPath: string,
): GyomuResultAsync<boolean> => {
  const sourceFilename = platform.join(gitTempPath, 'before');
  const destinationFilename = platform.join(gitTempPath, 'after');
  const diffFilename = platform.join(
    resultPath,
    filePath.replaceAll('/', '\\') + '.diff',
  );
  return result2Async(
    run(
      () => {
        platform.emptyDirSync(gitTempPath);

        platform.removeSync(sourceFilename);
        platform.removeSync(destinationFilename);
        const diffFilePath = platform.dirname(diffFilename);
        platform.ensureDirSync(diffFilePath);
      },
      IOError,
      'fail to prepare files for git diff',
    ).map(() => true),
  )
    .andThen(() =>
      runAsync(
        () => extractSingleFileEntry(source, sourceFilename),
        IOError,
        'fail to extract file source entry',
      ),
    )
    .andThen(() =>
      runAsync(
        () => extractSingleFileEntry(destination, destinationFilename),
        IOError,
        'fail to extract file destination entry',
      ),
    )
    .andThen(() =>
      result2Async(
        run(
          () => {
            const commandArg = [
              'diff',
              '--no-index',
              '--no-prefix',
              '--output',
              `${diffFilename}`,
              `${sourceFilename}`,
              `${destinationFilename}`,
            ];
            const result = spawnSync('git', commandArg, { cwd: gitTempPath });
            if (result.error) {
              throw new IOError('fail to git diff', result.error);
            }
            if (platform.existsSync(diffFilename) == false) {
              throw new IOError(`git diff error ${result.output.toString()}`);
            }
            removeUnnecessaryLinesFromDiffFile(diffFilename);
            return true;
          },
          IOError,
          'fail to generate diff files through git diff',
        ),
      ),
    );
};

const removeUnnecessaryLinesFromDiffFile = (diffFilename: string) => {
  platform.writeFileSync(
    diffFilename,
    platform.readFileSync(diffFilename, 'utf8').split('\n').slice(4).join('\n'),
    { flag: 'w', flush: true },
  );
};

const isComparisionExcludeTarget = (
  filePath: string,
  rule: FileNameExclusionRule,
  categories: string[],
): boolean => {
  const directories = filePath.split('\\');
  const fileName = directories[directories.length - 1];
  let isPathInScope = false;
  let targetCategry = '';
  let isExclude = false;
  for (const directory of directories) {
    if (categories.includes(directory)) {
      isPathInScope = true;
      targetCategry = directory;
      break;
    }
  }
  if (isPathInScope) {
    const criteriaList = rule[targetCategry];
    for (const criteria of criteriaList) {
      if (criteria.type === 'include') {
        if (
          !isExclude &&
          criteria.target &&
          criteria.target.length > 0 &&
          !criteria.target.find((t) => fileName.includes(t))
        ) {
          isExclude = true;
        }
        if (
          !isExclude &&
          criteria.targetRegEx &&
          criteria.targetRegEx.length > 0 &&
          !criteria.targetRegEx.find((r) => new RegExp(r).test(fileName))
        ) {
          isExclude = true;
        }
      } else if (criteria.type === 'exclude') {
        if (
          !isExclude &&
          criteria.target &&
          criteria.target.length > 0 &&
          criteria.target.find((t) => fileName.includes(t))
        ) {
          isExclude = true;
        }
        if (
          !isExclude &&
          criteria.targetRegEx &&
          criteria.targetRegEx.length > 0 &&
          criteria.targetRegEx.find((r) => new RegExp(r).test(fileName))
        ) {
          isExclude = true;
        }
      }
      if (isExclude) break;
    }
  }
  // if(isExclude)
  // {
  //   logger.info(filePath);
  // }
  return isExclude;
};
