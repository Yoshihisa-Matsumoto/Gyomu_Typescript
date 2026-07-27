import { Effect } from 'effect'
import { writeStringToFile } from '@gyomu/infra/fs'
import { FileAnalysisSchema } from '@gyomu/schema/schemas/typescript'
import { convertFromSchemaObjectToJsonWithEffect } from '@gyomu/schema/entity'
import { getFileAnalysisPath } from './getFileAnalysisPath.js'
import type { FileAnalysis } from '@gyomu/schema/schemas/typescript'
import type { ProjectContext } from './project/ProjectContext.js'

/**
 * Persists the file analysis results to disk by writing the JSON-serialized data to the project-specific path.
 *
 * @param context The current project context.
 *
 * @param analysis The file analysis result object to be saved.
 *
 * @returns An Effect representing the file write operation.
 */
export const saveFileAnalysis = (context: ProjectContext, analysis: FileAnalysis) =>
  Effect.gen(function* () {
    const fileAnalysisPath = getFileAnalysisPath(context, analysis.path)
    const jsonString = yield* convertFromSchemaObjectToJsonWithEffect('FileAnalysis')(
      FileAnalysisSchema,
      analysis,
    )
    yield* writeStringToFile(fileAnalysisPath, jsonString)
  })
