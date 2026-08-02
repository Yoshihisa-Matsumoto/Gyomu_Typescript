import { generateDocument } from '../document/generateDocument.js'
import { README_DOCUMENT_DEFINITION } from './definition.js'
import type { Effect } from 'effect'
import type { DocumentBuilderError } from '../error/DocumentBuilderError.js'

import type { AiModelRoute, ModelRoutes } from '@gyomu/ai'
import type { ProjectContext } from '@gyomu/ts-analysis'
import type { ConceptOptions } from '../ConceptOptions.js'
import type { FileSystem } from 'effect/FileSystem'
import type { FileSearchService } from '@gyomu/schema/shared/fs'

/**
 * Generates README files for a project across multiple supported languages.
 *
 * @param project The project context containing root paths and configuration.
 *
 * @param option Optional configuration for README generation.
 *
 * @returns An effect that generates localized README files. Requires AiModelRoute, FileSystem, ModelRoutes, and FileSearchService to execute. Fails with DocumentBuilderError.
 */
export const generateReadmeFiles = (
  project: ProjectContext,
  option?: ConceptOptions,
): Effect.Effect<
  void,
  DocumentBuilderError,
  AiModelRoute | FileSystem | ModelRoutes | FileSearchService
> => generateDocument(README_DOCUMENT_DEFINITION, project, option)
