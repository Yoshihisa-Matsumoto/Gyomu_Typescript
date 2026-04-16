import { pipe, Ref, Stream } from 'effect';
import { AppError } from '../../../base-error.js';
import { DiffDetail } from '../../../shared/object/diff.js';
import { Effect } from 'effect';
import { ensure } from '../../../shared/effect/core.js';
import { fs } from '../../fs/index.js';
import { IOError } from '../../../errors.js';
import { spawnSync } from 'node:child_process';
import {
  extractSingleFileEntry,
  ZipEntryItem,
  ZipFileEntryItem,
} from './internals/read.js';
import { PlatformError } from 'effect/PlatformError';
import { FileSystem } from 'effect/FileSystem';
import { jsonToCsv } from '../../csv/write.js';
import { ZipService } from './zipService.js';
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
  recordDelimiter?: 'windows' | 'unix';
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

// export type FileEntry = {
//   openStream: () => Stream.Stream<Uint8Array, AppError>;
// };

type DiffResult = {
  diff: DiffDetail[];
  diffExist: boolean;
};
type InterimOutputType = {
  sourceFiles: Map<string, ZipEntryItem>;
  destinationFiles: Map<string, ZipEntryItem>;
  results: DiffSummary[];
};

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
  AppError | PlatformError,
  FileSystem | ZipService
> => {
  const { sourceFilename, destinationFilename, resultPath } = option;

  return Effect.gen(function* () {
    yield* ensure(
      fs.existsSync(sourceFilename),
      IOError,
      `${sourceFilename} Not exist`,
    );
    yield* ensure(
      fs.existsSync(destinationFilename),
      IOError,
      `${destinationFilename} Not exist`,
    );

    yield* Effect.try({
      try: () => {
        fs.removeSync(resultPath);
        fs.emptyDirSync(resultPath);
      },
      catch: (e) => new IOError('Fail to prepare result directory', e),
    });

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
        path: fs.join(resultPath, summaryFilename),
      },
    );

    return results;
  });
  //let interimOutput: InterimOutputType | undefined = undefined;
  // const result = result2Async(
  //   ensure(
  //     platform.existsSync(sourceFilename),
  //     IOError,
  //     `${sourceFilename} Not exist`,
  //   ),
  // )
  //   .andThen(() =>
  //     ensure(
  //       platform.existsSync(destinationFilename),
  //       IOError,
  //       `${destinationFilename} Not exist`,
  //     ),
  //   )
  //   .andThen(() =>
  //     result2Async(
  //       run(
  //         () => {
  //           platform.removeSync(resultPath);
  //           platform.emptyDirSync(resultPath);
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
  //     },{type:'file',path: platform.join(resultPath, summaryFilename),});
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
  }) => Effect.Effect<DiffResult>,
) =>
  compareFunc({
    source: sourceFile,
    destination: destinationFile,
    filePath: sourceFile.path.replaceAll('/', '\\'),
    resultPath,
  });

const filterDiff = (diffResult: DiffResult, rule?: DiffernceIgnoreRule) => {
  const diffDetailList = [...diffResult.diff];
  const originalNumberOfDiff = diffDetailList.length;

  if (!rule) {
    return { diffDetailList, originalNumberOfDiff };
  }

  if (!rule.criteria) {
    return { diffDetailList: [], originalNumberOfDiff };
  }

  return {
    diffDetailList: diffDetailList.filter((diff) => {
      return !rule.criteria!.some(
        (c) =>
          new RegExp(c.pathRegExpression).test(diff.path) &&
          (!c.sourceValue || c.sourceValue === diff.sourceValue) &&
          (!c.destinationValue || c.destinationValue === diff.destinationValue),
      );
    }),
    originalNumberOfDiff,
  };
};
const shouldRunGitDiff = (
  diffDetailList: DiffDetail[],
  originalNumberOfDiff: number,
  diffResult: DiffResult,
) =>
  (originalNumberOfDiff === 0 && diffResult.diffExist) ||
  diffDetailList.length > 5 ||
  diffDetailList.some(
    (d) => d.sourceValue.length > 100 || d.destinationValue.length > 100,
  );
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
          fs.join(resultPath, sourceFile.path.replaceAll('/', '\\')) +
          '.diff.csv';

        yield* jsonToCsv(
          diffDetailList.sort((a, b) => a.path.localeCompare(b.path)),
          { bom: true, quoted: true, recordDelimiter: option.recordDelimiter },
          { type: 'file', path: filePath },
        );
      })
    : Effect.void;
const runCompareFuncFlow = (
  sourceFile: ZipFileEntryItem,
  destinationFile: ZipFileEntryItem,
  resultPath: string,
  compareFunc: (option: {
    source: ZipFileEntryItem;
    destination: ZipFileEntryItem;
    filePath: string;
    resultPath: string;
  }) => Effect.Effect<DiffResult>,
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
const internalCompareFileEntry = (
  sourceFile: ZipFileEntryItem,
  destinationFile: ZipFileEntryItem,
  interimOutput: Ref.Ref<InterimOutputType>,
  option: ZipCompareOption,
  compareFunc?: (option: {
    source: ZipFileEntryItem;
    destination: ZipFileEntryItem;
    filePath: string;
    resultPath: string;
  }) => Effect.Effect<DiffResult>,
) => {
  const { resultPath, diffIgnoreRule } = option;
  //const { results } = interimOutput;
  let targetIgnoreRule: IgnoreRule | undefined = undefined;
  if (
    sourceFile.uncompressedSize === destinationFile.uncompressedSize &&
    sourceFile.crc32 === destinationFile.crc32
  ) {
    //Exact Same Content
    return Effect.succeed(interimOutput);
  }

  //Something changed
  const diffSummaryRecord: DiffSummary | undefined = {
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

  return Effect.gen(function* () {
    if (compareFunc) {
      yield* runCompareFuncFlow(
        sourceFile,
        destinationFile,
        resultPath,
        compareFunc,
        targetIgnoreRule as DiffernceIgnoreRule | undefined,
        option,
      );
    }
    if (!diffSummaryRecord) return Effect.succeed(interimOutput);
    yield* Ref.update(interimOutput, (output) => {
      output.results.push(diffSummaryRecord);
      return output;
    });

    if (!option.includeOriginalFileInDiff) return Effect.succeed(interimOutput);

    const effects: Effect.Effect<void, AppError | PlatformError, FileSystem>[] =
      [];

    const sourcePath = fs.join(
      resultPath,
      sourceFile.path.replaceAll('/', '\\') + '.source',
    );

    if (!sourceFile.isDirectory) {
      effects.push(extractSingleFileEntry(sourceFile, sourcePath));
    }

    const destinationPath = fs.join(
      resultPath,
      destinationFile.path.replaceAll('/', '\\') + '.destination',
    );

    effects.push(extractSingleFileEntry(destinationFile, destinationPath));

    return Effect.as(Effect.all(effects), interimOutput);
  });
};
const handleMissingFileInComparison = (
  existingFile: ZipEntryItem,
  isSourceExist: boolean,
  interimOutput: Ref.Ref<InterimOutputType>,
  option: ZipCompareOption,
) => {
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
    if (existingFile.isDirectory) return Effect.succeed(interimOutput);

    return Effect.gen(function* () {
      yield* Ref.update(interimOutput, (output) => {
        output.results.push({
          path: existingFile.path,
          diff: `Only in ${existingPart}`,
        });
        return output;
      });
      const filePath = fs.join(
        resultPath,
        existingFile.path.replaceAll('/', '\\'),
      );
      return yield* Effect.as(
        extractSingleFileEntry(existingFile, filePath),
        interimOutput,
      );
    });
  }
  return Effect.succeed(interimOutput);
};
const gitTempPath = fs.join(fs.tmpdir(), 'gitCompareTemp');
const compareTextfile = (
  source: ZipFileEntryItem,
  destination: ZipFileEntryItem,
  filePath: string,
  resultPath: string,
): Effect.Effect<boolean, IOError | AppError | PlatformError, FileSystem> => {
  const sourceFilename = fs.join(gitTempPath, 'before');
  const destinationFilename = fs.join(gitTempPath, 'after');
  const diffFilename = fs.join(
    resultPath,
    filePath.replaceAll('/', '\\') + '.diff',
  );
  return pipe(
    // ① 事前準備
    Effect.try({
      try: () => {
        fs.emptyDirSync(gitTempPath);

        fs.removeSync(sourceFilename);
        fs.removeSync(destinationFilename);

        const diffFilePath = fs.dirname(diffFilename);
        fs.ensureDirSync(diffFilePath);
      },
      catch: (e) => new IOError('fail to prepare files for git diff', e),
    }),

    // ② source 展開
    Effect.andThen(extractSingleFileEntry(source, sourceFilename)),

    // ③ destination 展開
    Effect.andThen(extractSingleFileEntry(destination, destinationFilename)),

    // ④ git diff 実行
    Effect.andThen(
      Effect.try({
        try: () => {
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

          if (!fs.existsSync(diffFilename)) {
            throw new Error(result.output?.toString());
          }

          removeUnnecessaryLinesFromDiffFile(diffFilename);

          return true;
        },
        catch: (e) =>
          new IOError('fail to generate diff files through git diff', e),
      }),
    ),
  );
};

const removeUnnecessaryLinesFromDiffFile = (diffFilename: string) => {
  fs.writeFileSync(
    diffFilename,
    fs.readFileSync(diffFilename, 'utf8').split('\n').slice(4).join('\n'),
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
