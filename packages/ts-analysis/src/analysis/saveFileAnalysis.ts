import { join } from 'node:path'
import { Effect } from 'effect'
import { writeStringToFile } from '@gyomu/infra/fs'
import { FileAnalysisSchema } from '@gyomu/schema/schemas/typescript'
import { convertFromSchemaObjectToJsonWithEffect } from '@gyomu/schema/entity'
import type { FileAnalysis } from '@gyomu/schema/schemas/typescript'
import type { ProjectContext } from './project/ProjectContext.js'

export const saveFileAnalysis = (context: ProjectContext, analysis: FileAnalysis) =>
  Effect.gen(function* () {
    const fileAnalysisPath = join(context.projectRoot, '.gyomu', analysis.path + '.json')
    const jsonString = yield* convertFromSchemaObjectToJsonWithEffect('FileAnalysis')(
      FileAnalysisSchema,
      analysis,
    )
    yield* writeStringToFile(fileAnalysisPath, jsonString)
  })
