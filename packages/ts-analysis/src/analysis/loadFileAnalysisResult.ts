import { Effect } from 'effect'
import { loadFileAnalysis } from './loadFileAnalysis.js'
import { analyzeFile } from './analyzeFile.js'
import type { FileSystem } from 'effect'
import type { AnalysisError } from './error/AnalysisError.js'
import type {
  DocumentableTarget,
  FileAnalysisMetadata,
  FileAnalysisResult,
  FileAnalysisTransient,
} from './file/FileAnalysisResult.js'
import type { LoadAnalysisOptions } from './AnalysisOption.js'
import type { ProjectContext } from './project/ProjectContext.js'
import type {
  DependencyCandidate,
  ParsedJsDoc,
  ProjectRelativePath,
  SymbolId,
} from '@gyomu/schema/typescript'

export const loadFileAnalysisResult = (
  context: ProjectContext,
  /**
   * Path accepted by {@link Project.getSourceFile}.
   */
  sourceFilePath: ProjectRelativePath,
  option?: LoadAnalysisOptions,
): Effect.Effect<
  { result: FileAnalysisResult; created: boolean },
  AnalysisError,
  FileSystem.FileSystem
> =>
  Effect.gen(function* () {
    const metadata: FileAnalysisMetadata = {
      parsedJsDocs: new Map<string, ParsedJsDoc>(),
      symbols: new Map<string, DocumentableTarget>(),
    }
    const transient: FileAnalysisTransient = {
      dependencyCandidates: new Map<SymbolId, ReadonlyArray<DependencyCandidate>>(),
    }
    const analysis = yield* loadFileAnalysis(context, sourceFilePath)
    if (!analysis) {
      return { result: yield* analyzeFile(context, sourceFilePath, option), created: true }
    }

    // compute metadata / transient
    if (option?.computeMetadataAndTransient) {
      //
    }

    return {
      result: {
        analysis,
        metadata,
        transient,
      },
      created: false,
    }
  })
