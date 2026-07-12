import { Effect } from 'effect'
import { writeStringToFile } from '@gyomu/infra/fs'
import { logger, wrapInfraError } from '@gyomu/schema'
import { ConceptError } from '../error/ConceptError.js'
import { buildFilConceptInput } from './internal/buildFileConceptInput.js'
import { generateSummary } from './internal/generateSummary.js'
import type { ConceptOptions } from '../ConceptOptions.js'
import type { FileAnalysisContext } from '@gyomu/schema/typescript'

export const computeFileSummary = (context: FileAnalysisContext, option?: ConceptOptions) =>
  Effect.gen(function* () {
    const input = buildFilConceptInput(context)
    if (option?.debugInfo?.FileSummaryInput) {
      if (option.debugInfo.DumpToFile)
        yield* writeStringToFile('./log/FileConceptInput.txt', JSON.stringify(input, null, 2), {
          flag: 'a',
        })
      else logger.info(input, `File Summary Input:${input.path}`)
    }

    return yield* generateSummary(input, option)
  }).pipe(
    Effect.mapError((e) =>
      wrapInfraError(ConceptError, e, () => ({
        filePath: context.analysis.path,
        message: 'Fail to generate File Summary',
        phase: 'file-summary' as const,
        details: context,
      })),
    ),
  )
