import { join } from 'node:path'
import { Effect } from 'effect'
import { writeStringToFile } from '@gyomu/infra/fs'
import type { FileAnalysis } from '@gyomu/schema/schemas/typescript'
import type { ProjectContext } from './project/ProjectContext.js'

export const saveFileAnalysis = (context: ProjectContext, analysis: FileAnalysis) =>
  Effect.gen(function* () {
    const fileAnalysisPath = join(context.projectRoot, '.gyomu', analysis.path + '.json')
    yield* writeStringToFile(fileAnalysisPath, JSON.stringify(analysis, null, 2))
  })
