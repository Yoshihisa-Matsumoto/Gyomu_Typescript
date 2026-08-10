import { generateDocument } from '../document/generateDocument.js'
import { LLMCONTEXT_DOCUMENT_DEFINITION } from './LLMContextDefinition.js'
import type { Effect } from 'effect'
import type { DocumentBuilderError } from '../error/DocumentBuilderError.js'

import type { AiModelRoute, ModelRoutes } from '@gyomu/ai'
import type { ProjectContext } from '@gyomu/ts-analysis'
import type { ConceptOptions } from '../ConceptOptions.js'
import type { FileSystem } from 'effect/FileSystem'
import type { FileSearchService } from '@gyomu/schema/shared/fs'

/**
 * Generates an LLM context file based on the provided project context and options.
 *
 * @param project The project context data used to generate the document.
 *
 * @param option Optional configuration for the generation process.
 *
 * @returns Returns an Effect that performs the document generation, which may result in a DocumentBuilderError.
 *
 * @requires AiModelRoute, FileSystem, ModelRoutes, and FileSearchService.
 */
export const generateLlmContextFile = (
  project: ProjectContext,
  option?: ConceptOptions,
): Effect.Effect<
  void,
  DocumentBuilderError,
  AiModelRoute | FileSystem | ModelRoutes | FileSearchService
> => generateDocument(LLMCONTEXT_DOCUMENT_DEFINITION, project, option)
