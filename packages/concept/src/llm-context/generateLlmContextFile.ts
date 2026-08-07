import { generateDocument } from '../document/generateDocument.js'
import { LLMCONTEXT_DOCUMENT_DEFINITION } from './LLMContextDefinition.js'
import type { Effect } from 'effect'
import type { DocumentBuilderError } from '../error/DocumentBuilderError.js'

import type { AiModelRoute, ModelRoutes } from '@gyomu/ai'
import type { ProjectContext } from '@gyomu/ts-analysis'
import type { ConceptOptions } from '../ConceptOptions.js'
import type { FileSystem } from 'effect/FileSystem'
import type { FileSearchService } from '@gyomu/schema/shared/fs'

export const generateLlmContextFile = (
  project: ProjectContext,
  option?: ConceptOptions,
): Effect.Effect<
  void,
  DocumentBuilderError,
  AiModelRoute | FileSystem | ModelRoutes | FileSearchService
> => generateDocument(LLMCONTEXT_DOCUMENT_DEFINITION, project, option)
