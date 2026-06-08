import { Effect } from 'effect'
import { Project } from 'ts-morph'
import { toProjectAbsolutePath, toProjectRelativePath } from '../shared/index.js'
import { loadSourceFile } from './shared/loadSourceFile.js'
import { extractExport } from './extract/extractExport.js'
import { extractImport } from './extract/extractImport.js'
import { toIdentityKey } from './symbol/SymbolAnalysis.js'
import type {
  DocumentableTarget,
  FileAnalysisMetadata,
  FileAnalysisResult,
} from './file/FileAnalysisResult.js'
import type { AnalysisOptions } from './AnalysisOption.js'
import type { FileAnalysis } from './file/FileAnalysis.js'
import type { AnalysisError } from './error/AnalysisError.js'
import type { ProjectRelativePath } from './types.js'
import type { ProjectContext } from './project/ProjectContext.js'
import type { ParsedJsDoc } from './jsdoc/ParsedJsDoc.js'
import type { SymbolAnalysis } from './symbol/SymbolAnalysis.js'

/**
 * Analyzes a TypeScript source file and produces a {@link FileAnalysis}.
 *
 * @param context project containing the target source file.
 *
 * @param sourceFilePath Path used to locate the source file via
 * {@link Project.getSourceFile}.
 *
 * This value may be either:
 *
 * - a project-relative source path
 * - an absolute source file path
 *
 * depending on how the ts-morph project was configured.
 *
 * @param option Analysis options.
 *
 * @returns File analysis result including imports and exports.
 */
export const analyzeFile = (
  context: ProjectContext,
  /**
   * Path accepted by {@link Project.getSourceFile}.
   */
  sourceFilePath: ProjectRelativePath,
  option?: AnalysisOptions,
): Effect.Effect<FileAnalysisResult, AnalysisError> =>
  Effect.gen(function* () {
    const metadata: FileAnalysisMetadata = {
      parsedJsDocs: new Map<string, ParsedJsDoc>(),
      symbols: new Map<string, DocumentableTarget>(),
    }
    const sourceFullPath = toProjectAbsolutePath(sourceFilePath, context.projectRoot)
    const sourceRelativePath = toProjectRelativePath(sourceFilePath, context.projectRoot)

    const sourceFile = yield* loadSourceFile(context.project, sourceFullPath)
    sourceFile.path = sourceRelativePath

    const exports = yield* extractExport(sourceFile, metadata, option)
    const imports = yield* extractImport(sourceFile, metadata, option)

    const symbols: Map<string, SymbolAnalysis> = new Map<string, SymbolAnalysis>()
    exports.forEach((exp) => {
      const symbol = exp.symbol
      const symbolKey = toIdentityKey(symbol.identity)
      symbols.set(symbolKey, symbol)
    })
    return {
      analysis: {
        path: sourceRelativePath,
        exports,
        imports,
        symbols,
      } satisfies FileAnalysis,
      metadata,
    }
  })
