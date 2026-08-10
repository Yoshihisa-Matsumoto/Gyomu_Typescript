import { join } from 'node:path'
import { Effect } from 'effect'
import { readYamlFromFileAndValidate } from '@gyomu/infra/fs'
import { CodingGuideline } from '@gyomu/schema/schemas/knowledge'
import { wrapInfraError } from '@gyomu/schema'
import { initializeDocumentBaseContext } from '../document/initializeDocumentBaseContext.js'
import { getKnowledgePath } from '../document/path/getKnowledgePath.js'
import { getRootKnowledgePath } from '../document/path/getRootKnowledgePath.js'
import { DocumentBuilderError } from '../error/DocumentBuilderError.js'
import { mergeCodingGuideline } from './mergeCodingGuideline.js'
import type { ConceptOptions } from '../ConceptOptions.js'
import type { FileSystem } from 'effect'
import type { ProjectContext } from '@gyomu/ts-analysis'
import type { LlmContextBuildContext } from '@gyomu/schema/concept'
import type { FileSearchService } from '@gyomu/schema/shared/fs'

/**
 * Initializes the build context for the LLM by merging project-level and knowledge-level coding guidelines.
 *
 * @param context The project context object.
 *
 * @param option Optional configuration for the concept.
 *
 * @returns An Effect that resolves to the initialized LlmContextBuildContext, or fails with a DocumentBuilderError.
 *
 * @requires {FileSystem.FileSystem | FileSearchService} Requires file system access and file search capabilities.
 */
export const initializeLlmContextBuildContext = (
  context: ProjectContext,
  option?: ConceptOptions,
): Effect.Effect<
  LlmContextBuildContext,
  DocumentBuilderError,
  FileSystem.FileSystem | FileSearchService
> =>
  Effect.gen(function* () {
    const baseContext = yield* initializeDocumentBaseContext(context, option)

    const rootKnowledgePath = yield* getRootKnowledgePath(context, option)
    const rootCodingGuideline = yield* readYamlFromFileAndValidate(
      'Coding',
      CodingGuideline,
      join(rootKnowledgePath, 'Coding.yaml'),
    )
    const knowledgePath = getKnowledgePath(context, option)
    const codingGuildeline = yield* readYamlFromFileAndValidate(
      'Coding',
      CodingGuideline,
      join(knowledgePath, 'Coding.yaml'),
    ).pipe(Effect.catch((e) => Effect.succeed(undefined)))

    const resultContext = {
      ...baseContext.context,
      knowledge: {
        ...baseContext.context.knowledge,
        codingGuideline: mergeCodingGuideline(rootCodingGuideline, codingGuildeline),
      },
    } satisfies LlmContextBuildContext
    return resultContext
  }).pipe(
    Effect.mapError((e) =>
      wrapInfraError(DocumentBuilderError, e, () => ({
        packageName: context.projectName,
        phase: 'context-build' as const,
        message: 'Fail to build LLM context',
      })),
    ),
  )
