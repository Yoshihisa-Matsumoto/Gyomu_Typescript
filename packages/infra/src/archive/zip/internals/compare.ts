import { Effect } from 'effect';
import { Ref } from 'effect';
import { DiffDetail } from '@gyomu/core/shared/object';

import {
  ZipEntryItem,
  ZipFileEntryItem,
  extractSingleFileEntry,
} from './read.js';
import { FileSystem } from 'effect';
import { PlatformError } from 'effect/PlatformError';
import { runCompareFuncFlow } from '../compare.js';
import path from 'path';
import { IOError } from '@gyomu/core';

export type DiffernceIgnoreRule = {
  filePathRegExpression: string;
  type: 'Different';
  criteria: {
    pathRegExpression: string;
    sourceValue?: string;
    destinationValue?: string;
  }[];
}; // export type FileEntry = {

export type InterimOutputType = {
  sourceFiles: Map<string, ZipEntryItem>;
  destinationFiles: Map<string, ZipEntryItem>;
  results: DiffSummary[];
};
export type ZipCompareOption = {
  sourceFilename: string;
  destinationFilename: string;
  resultPath: string;
  diffIgnoreRule?: IgnoreRule[];
  fileNameExcludeRule?: FileNameExclusionRule;
  includeOriginalFileInDiff?: boolean;
  recordDelimiter?: 'windows' | 'unix';
};
export type IgnoreRule = DiffernceIgnoreRule | ExistInOnlyOnePartyIgnoreRule;

export const filterDiff = (
  diffResult: DiffResult,
  rule?: DiffernceIgnoreRule,
) => {
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
export const shouldRunGitDiff = (
  diffDetailList: DiffDetail[],
  originalNumberOfDiff: number,
  diffResult: DiffResult,
) =>
  (originalNumberOfDiff === 0 && diffResult.diffExist) ||
  diffDetailList.length > 5 ||
  diffDetailList.some(
    (d) => d.sourceValue.length > 100 || d.destinationValue.length > 100,
  );
export const isComparisionExcludeTarget = (
  filePath: string,
  rule: FileNameExclusionRule,
  categories: string[],
): boolean => {
  const directories = filePath.split(/[\\/]+/);
  const fileName = path.basename(filePath);
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
    const criteriaList = rule[targetCategry]!;
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
export type FileNameExclusionRule = {
  [path: string]: {
    type: 'include' | 'exclude';
    target?: string[];
    targetRegEx?: string[];
  }[];
};

//   openStream: () => Stream.Stream<Uint8Array, AppError>;
// };

export type DiffResult = {
  diff: DiffDetail[];
  diffExist: boolean;
};
export const handleMissingFileInComparison = (
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
      const filePath = path.join(
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
export type DiffSummary = {
  path: string;
  diff: 'Only in Source' | 'Only in Destination' | 'Different';
};
export type ExistInOnlyOnePartyIgnoreRule = {
  filePathRegExpression: string;
  type: 'Only in Source' | 'Only in Destination';
};
export const internalCompareFileEntry = (
  sourceFile: ZipFileEntryItem,
  destinationFile: ZipFileEntryItem,
  interimOutput: Ref.Ref<InterimOutputType>,
  option: ZipCompareOption,
  compareFunc?: (option: {
    source: ZipFileEntryItem;
    destination: ZipFileEntryItem;
    filePath: string;
    resultPath: string;
  }) => Effect.Effect<DiffResult, IOError>,
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

  const result = Effect.gen(function* () {
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
    if (!diffSummaryRecord) return interimOutput;
    yield* Ref.update(interimOutput, (output) => {
      output.results.push(diffSummaryRecord);
      return output;
    });

    if (!option.includeOriginalFileInDiff) return interimOutput;

    const effects: Effect.Effect<
      void,
      IOError | PlatformError,
      FileSystem.FileSystem
    >[] = [];

    const sourcePath = path.join(
      resultPath,
      sourceFile.path.replaceAll('/', '\\') + '.source',
    );

    if (!sourceFile.isDirectory) {
      effects.push(extractSingleFileEntry(sourceFile, sourcePath));
    }

    const destinationPath = path.join(
      resultPath,
      destinationFile.path.replaceAll('/', '\\') + '.destination',
    );

    effects.push(extractSingleFileEntry(destinationFile, destinationPath));

    const result = yield* Effect.as(Effect.all(effects), interimOutput);
    return result;
  });
  return result;
};
