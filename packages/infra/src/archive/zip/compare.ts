import { Ref, Stream } from 'effect';
import { wrapInfraError } from '@gyomu/shared';
import { DiffDetail } from '@gyomu/core/shared/object';
import { Effect } from 'effect';
import {
  ensure,
  ensureEffect,
  fromPromise,
  fromSync,
} from '@gyomu/shared/effect';
//import { fs } from '../../fs/index.js';
import { IOError } from '@gyomu/core';
import { spawnSync } from 'node:child_process';
import {
  extractSingleFileEntry,
  ZipEntryItem,
  ZipFileEntryItem,
} from './internals/read.js';
import { PlatformError } from 'effect/PlatformError';
import { FileSystem } from 'effect';
import { jsonToCsv } from '../../csv/write.js';
import { ZipService } from './ZipService.js';
import {
  DiffernceIgnoreRule,
  DiffResult,
  DiffSummary,
  filterDiff,
  handleMissingFileInComparison,
  InterimOutputType,
  internalCompareFileEntry,
  isComparisionExcludeTarget,
  shouldRunGitDiff,
  ZipCompareOption,
} from './internals/compare.js';
import {
  emptyDir,
  makeDirectory,
  pathExists,
  readStringFromFile,
  removePath,
  writeStringToFile,
} from '../../fs/fs-utils.js';
import path from 'path';
import { tmpdir } from 'os';

// export type DiffDetail = {
//   path: string;
//   sourceValue: string;
//   destinationValue: string;
// };

const summaryFilename = '@summary.csv';
export const compareZip = (
  option: ZipCompareOption,
  compareFunc?: (option: {
    source: ZipFileEntryItem;
    destination: ZipFileEntryItem;
    filePath: string;
    resultPath: string;
  }) => Effect.Effect<DiffResult>,
): Effect.Effect<
  DiffSummary[] | undefined,
  IOError | PlatformError,
  FileSystem.FileSystem | ZipService
> => {
  const { sourceFilename, destinationFilename, resultPath } = option;

  return Effect.gen(function* () {
    yield* ensureEffect(pathExists(sourceFilename), IOError, (e) => ({
      message: 'file not exist',
      target: sourceFilename,
      layer: 'archive' as const,
      operation: 'read' as const,
      cause: e,
    }));
    yield* ensureEffect(pathExists(destinationFilename), IOError, (e) => ({
      message: 'file not exist',
      target: destinationFilename,
      layer: 'archive' as const,
      operation: 'read' as const,
      cause: e,
    }));
    yield* emptyDir(resultPath).pipe(
      Effect.mapError((e) =>
        wrapInfraError(
          IOError,
          `Fail to prepare empty directory on ${resultPath}`,
        ),
      ),
    );

    // Zip取得
    const zip = yield* ZipService;
    const [sourceEntriesMap, destinationEntriesMap] = yield* Effect.all([
      zip.unarchiveFromFile(sourceFilename).pipe(
        Stream.runFold(
          () => new Map<string, ZipEntryItem>(),
          (map, entry) => {
            map.set(entry.path, entry);
            return map;
          },
        ),
      ),
      zip.unarchiveFromFile(destinationFilename).pipe(
        Stream.runFold(
          () => new Map<string, ZipEntryItem>(),
          (map, entry) => {
            map.set(entry.path, entry);
            return map;
          },
        ),
      ),
    ]);
    const state = yield* Ref.make<InterimOutputType>({
      sourceFiles: sourceEntriesMap,
      destinationFiles: destinationEntriesMap,
      results: [],
    });

    yield* Effect.forEach(
      Array.from(sourceEntriesMap.values()),
      (sourceFile) =>
        Effect.gen(function* () {
          if (
            option.fileNameExcludeRule &&
            isComparisionExcludeTarget(
              sourceFile.path.replaceAll('/', '\\'),
              option.fileNameExcludeRule,
              Object.keys(option.fileNameExcludeRule),
            )
          ) {
            //比較除外条件に入ったものは何もしないvalues()
            return;
          }
          const destinationFile = destinationEntriesMap.get(sourceFile.path);
          if (destinationFile) {
            if (sourceFile.isDirectory || destinationFile.isDirectory) {
              return;
            }
            //File exist on both zip, need comparison
            yield* internalCompareFileEntry(
              sourceFile,
              destinationFile,
              state,
              option,
              compareFunc,
            );
          } else {
            yield* handleMissingFileInComparison(
              sourceFile,
              true,
              state,
              option,
            );
          }
        }),
      { concurrency: 1 },
    );
    yield* Effect.forEach(
      Array.from(destinationEntriesMap.values()),
      (destinationFile) =>
        Effect.gen(function* () {
          const sourceFile = sourceEntriesMap.get(destinationFile.path);
          if (sourceFile) return;
          if (
            option.fileNameExcludeRule &&
            isComparisionExcludeTarget(
              destinationFile.path.replaceAll('/', '\\'),
              option.fileNameExcludeRule,
              Object.keys(option.fileNameExcludeRule),
            )
          ) {
            //比較除外条件に入ったものは何もしない
            return;
          }
          yield* handleMissingFileInComparison(
            destinationFile,
            false,
            state,
            option,
          );
        }),
      { concurrency: 1 },
    );

    const results = yield* Ref.get(state).pipe(Effect.map((s) => s.results));

    if (results.length === 0) return undefined;

    results.sort((a, b) => a.path.localeCompare(b.path));

    yield* jsonToCsv(
      results,
      {
        bom: true,
        quoted: true,
        recordDelimiter: option.recordDelimiter,
      },
      {
        type: 'file',
        path: path.join(resultPath, summaryFilename),
      },
    );

    return results;
  });
  //let interimOutput: InterimOutputType | undefined = undefined;
  // const result = result2Async(
  //   ensure(
  //     path.existsSync(sourceFilename),
  //     IOError,
  //     `${sourceFilename} Not exist`,
  //   ),
  // )
  //   .andThen(() =>
  //     ensure(
  //       path.existsSync(destinationFilename),
  //       IOError,
  //       `${destinationFilename} Not exist`,
  //     ),
  //   )
  //   .andThen(() =>
  //     result2Async(
  //       run(
  //         () => {
  //           path.removeSync(resultPath);
  //           path.emptyDirSync(resultPath);
  //         },
  //         IOError,
  //         'fail to prepare files to compare',
  //       ).map(() => true),
  //     ),
  //   )
  // .andThen(() =>
  //   runAsync(
  //     async () => {
  //       //状態初期化
  //       interimOutput = {
  //         sourceFiles:
  //           await ZipArchive.retrieveCentralDirectories(sourceFilename),
  //         destinationFiles:
  //           await ZipArchive.retrieveCentralDirectories(destinationFilename),
  //         results: [],
  //         promises: [],
  //       };
  //       return interimOutput;
  //     },
  //     IOError,
  //     'fail to initialize interim output',
  //   ),
  // )
  // .andThen((interimOutput) => {
  //   //ソースファイルから比較するパターン
  //   return sequenceReduce(
  //     Array.from(interimOutput.sourceFiles.entries.values()),
  //     interimOutput,
  //     (previousOutput, sourceFile) => {
  //       if (
  //         option.fileNameExcludeRule &&
  //         isComparisionExcludeTarget(
  //           sourceFile.path.replaceAll('/', '\\'),
  //           option.fileNameExcludeRule,
  //           Object.keys(option.fileNameExcludeRule),
  //         )
  //       ) {
  //         //比較除外条件に入ったものは何もしないvalues()
  //         return okAsync(previousOutput);
  //       }
  //       const destinationFile = interimOutput.destinationFiles.entries.get(
  //         sourceFile.path,
  //       );
  //       if (destinationFile) {
  //         if (sourceFile.isDirectory || destinationFile.isDirectory) {
  //           return okAsync(interimOutput);
  //         }
  //         //File exist on both zip, need comparison
  //         return internalCompareFileEntry(
  //           sourceFile,
  //           destinationFile,
  //           interimOutput,
  //           option,
  //           compareFunc,
  //         );
  //       } else {
  //         //File exist only in source zip
  //         return handleMissingFileInComparison(
  //           sourceFile,
  //           true,
  //           interimOutput,
  //           option,
  //         );
  //       }
  //     },
  //   );
  // })
  // .andThen((interimOutput) => {
  //   //デスティネーションファイルから比較するパターン
  //   return sequenceReduce(
  //     Array.from(interimOutput.destinationFiles.entries.values()),
  //     interimOutput,
  //     (_, destinationFile) => {
  //       const sourceFile = interimOutput.sourceFiles.entries.get(
  //         destinationFile.path,
  //       );
  //       if (sourceFile) return okAsync(interimOutput);
  //       if (
  //         option.fileNameExcludeRule &&
  //         isComparisionExcludeTarget(
  //           destinationFile.path.replaceAll('/', '\\'),
  //           option.fileNameExcludeRule,
  //           Object.keys(option.fileNameExcludeRule),
  //         )
  //       ) {
  //         return okAsync(interimOutput);
  //       }
  //       return handleMissingFileInComparison(
  //         destinationFile,
  //         false,
  //         interimOutput,
  //         option,
  //       );
  //     },
  //   );
  // })
  // .andThen((interimOutput) =>
  //   runAsync(
  //     async () => {
  //       const allPromiseResults = await Promise.allSettled<boolean>(
  //         interimOutput.promises,
  //       );
  //       const failedResult = allPromiseResults
  //         .filter((f) => f.status === 'rejected')
  //         .map((f) => f.reason);
  //       if (failedResult && failedResult.length > 0) {
  //         throw new IOError('Fail to compare zips', failedResult);
  //       }
  //       return interimOutput.results;
  //     },
  //     IOError,
  //     'Fail to finalize zip comparison',
  //   ),
  // )
  //   .andThen((results) => {
  //     if (results.length == 0) return okAsync(undefined);

  //     results.sort((a, b) => {
  //       if (a.path < b.path) {
  //         return -1;
  //       } else if (a.path > b.path) {
  //         return 1;
  //       } else {
  //         return 0;
  //       }
  //     });
  //     return jsonToCsv(results, {

  //       bom: true,
  //       quoted: true,
  //     },{type:'file',path: path.join(resultPath, summaryFilename),});
  //   });
  // return result;
};

const runCompare = (
  sourceFile: ZipFileEntryItem,
  destinationFile: ZipFileEntryItem,

  resultPath: string,
  compareFunc: (option: {
    source: ZipFileEntryItem;
    destination: ZipFileEntryItem;
    filePath: string;
    resultPath: string;
  }) => Effect.Effect<DiffResult, IOError>,
) =>
  compareFunc({
    source: sourceFile,
    destination: destinationFile,
    filePath: sourceFile.path.replaceAll('/', '\\'),
    resultPath,
  });

const runGitDiffIfNeeded = (
  sourceFile: ZipFileEntryItem,
  destinationFile: ZipFileEntryItem,
  filePath: string,
  resultPath: string,
  shouldRun: boolean,
) =>
  shouldRun
    ? compareTextfile(sourceFile, destinationFile, filePath, resultPath)
    : Effect.void;

const writeCsvIfNeeded = (
  diffDetailList: DiffDetail[],
  resultPath: string,
  sourceFile: ZipFileEntryItem,
  option: ZipCompareOption,
) =>
  diffDetailList.length > 0
    ? Effect.gen(function* () {
        const filePath =
          path.join(resultPath, sourceFile.path.replaceAll('/', '\\')) +
          '.diff.csv';

        yield* jsonToCsv(
          diffDetailList.sort((a, b) => a.path.localeCompare(b.path)),
          { bom: true, quoted: true, recordDelimiter: option.recordDelimiter },
          { type: 'file', path: filePath },
        );
      })
    : Effect.void;
export const runCompareFuncFlow = (
  sourceFile: ZipFileEntryItem,
  destinationFile: ZipFileEntryItem,
  resultPath: string,
  compareFunc: (option: {
    source: ZipFileEntryItem;
    destination: ZipFileEntryItem;
    filePath: string;
    resultPath: string;
  }) => Effect.Effect<DiffResult, IOError>,
  targetIgnoreRule: DiffernceIgnoreRule | undefined,
  option: ZipCompareOption,
) => {
  return Effect.gen(function* () {
    const diffResult = yield* runCompare(
      sourceFile,
      destinationFile,
      resultPath,
      compareFunc,
    );
    const { diffDetailList, originalNumberOfDiff } = filterDiff(
      diffResult,
      targetIgnoreRule,
    );
    const shouldRun = shouldRunGitDiff(
      diffDetailList,
      originalNumberOfDiff,
      diffResult,
    );
    yield* runGitDiffIfNeeded(
      sourceFile,
      destinationFile,
      sourceFile.path.replaceAll('/', '\\'),
      resultPath,
      shouldRun,
    );
    yield* writeCsvIfNeeded(diffDetailList, resultPath, sourceFile, option);
    return {
      diffResult,
      diffDetailList,
      originalNumberOfDiff,
    };
  });
};

const compareTextfile = (
  source: ZipFileEntryItem,
  destination: ZipFileEntryItem,
  filePath: string,
  resultPath: string,
): Effect.Effect<boolean, IOError, FileSystem.FileSystem> => {
  return Effect.gen(function* () {
    const gitTempPath = path.join(tmpdir(), 'gitCompareTemp');
    const sourceFilename = path.join(gitTempPath, 'before');
    const destinationFilename = path.join(gitTempPath, 'after');
    const diffFilename = path.join(
      resultPath,
      filePath.replaceAll('/', '\\') + '.diff',
    );

    yield* emptyDir(gitTempPath);

    yield* removePath(sourceFilename);
    yield* removePath(destinationFilename);

    const diffFilePath = path.dirname(diffFilename);
    yield* makeDirectory(diffFilePath);

    // ② source 展開
    yield* extractSingleFileEntry(source, sourceFilename);
    // ③ destination 展開
    yield* extractSingleFileEntry(destination, destinationFilename);
    // ④ git diff 実行
    const outputMessage = yield* fromSync(IOError, () => ({
      message: 'fail to generate diff files through git diff',
      layer: 'filesystem' as const,
      details: {
        sourceFilename,
        destinationFilename,
        diffFilename,
        gitTempPath,
      },
      operation: 'read' as const,
    }))(() => {
      const commandArg = [
        'diff',
        '--no-index',
        '--no-prefix',
        '--output',
        diffFilename,
        sourceFilename,
        destinationFilename,
      ];

      const result = spawnSync('git', commandArg, {
        cwd: gitTempPath,
      });

      if (result.error) {
        throw result.error;
      }
      return result.output?.toString();
    });

    if (!(yield* pathExists(diffFilename))) {
      throw new IOError({
        message: 'spawn on git diff fail',
        details: outputMessage,
        layer: 'filesystem',
        operation: 'read',
        cause: diffFilename,
      });
    }

    yield* removeUnnecessaryLinesFromDiffFile(diffFilename);

    return true;
  });
  // }).pipe(
  //   Effect.mapError((e) =>
  //     unknownError(
  //       IOError,
  //       e,
  //       `Fail to compare Text file ${source.path} vs ${destination.path}`,
  //     ),
  //   ),
  // );

  // return pipe(

  //   // ④ git diff 実行
  //   Effect.andThen(
  //     Effect.try({
  //       try: () => {
  //         const commandArg = [
  //           'diff',
  //           '--no-index',
  //           '--no-prefix',
  //           '--output',
  //           diffFilename,
  //           sourceFilename,
  //           destinationFilename,
  //         ];

  //         const result = spawnSync('git', commandArg, {
  //           cwd: gitTempPath,
  //         });

  //         if (result.error) {
  //           throw result.error;
  //         }

  //         if (!fs.existsSync(diffFilename)) {
  //           throw new Error(result.output?.toString());
  //         }

  //         removeUnnecessaryLinesFromDiffFile(diffFilename);

  //         return true;
  //       },
  //       catch: (e) =>
  //         new IOError('fail to generate diff files through git diff', e),
  //     }),
  //   ),
  // );
};

const removeUnnecessaryLinesFromDiffFile = (diffFilename: string) => {
  return Effect.gen(function* () {
    const content = (yield* readStringFromFile(diffFilename, 'utf8'))
      .split('\n')
      .slice(4)
      .join('\n');
    yield* writeStringToFile(diffFilename, content, { flag: 'w' });
  });
};
