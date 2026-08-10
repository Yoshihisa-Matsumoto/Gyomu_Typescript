import type { ConceptOptions } from '../ConceptOptions.js'
import type { Effect, FileSystem } from 'effect'
import type { DocumentBaseContext } from '@gyomu/schema/concept'
import type { LanguageCodes } from '@gyomu/schema/schemas/document'
import type { SectionBuilder } from './builder/SectionBuilder.js'
import type { DocumentBuilderError } from '../error/DocumentBuilderError.js'
import type { TranslatedDocument } from './translation/TranslatedDocument.js'
import type { ProjectContext } from '@gyomu/ts-analysis'
import type { FileSearchService } from '@gyomu/schema/shared/fs'

/**
 * Defines the structure and configuration for a document, including section builders, language support, and context creation.
 */
export interface DocumentDefinition<
  TSectionId extends string,
  TContext extends DocumentBaseContext,
  TOptions extends ConceptOptions,
  TRendererOptions = never,
> {
  /**
   * Creates a document context using the provided project and optional configuration.
   *
   * @returns An Effect that yields the document context, or fails with a DocumentBuilderError.
   */
  createContext: (
    project: ProjectContext,
    option?: TOptions,
  ) => Effect.Effect<TContext, DocumentBuilderError, FileSystem.FileSystem | FileSearchService>

  /**
   * The list of languages supported by this document definition.
   */
  supportedLanguages: ReadonlyArray<LanguageCodes>

  /**
   * A collection of builders used to construct the document sections.
   */
  sectionBuilders: ReadonlyArray<SectionBuilder<TSectionId, TContext, any>>

  /**
   * The specification for the document output format and configuration.
   */
  output: DocumentOutput<TContext, TOptions, TRendererOptions>

  /**
   * Optional configuration settings for the document renderer.
   */
  rendererOptions?: TRendererOptions
}

interface DocumentOutput<
  TContext extends DocumentBaseContext,
  TOptions extends ConceptOptions,
  TRendererOptions,
> {
  renderer: DocumentRenderer<TContext, TOptions, TRendererOptions>
  filepathResolver: FilepathResolver
}

/**
 * Defines a renderer capable of producing a final document from a given context and translation.
 */
export interface DocumentRenderer<
  TContext extends DocumentBaseContext,
  TOptions extends ConceptOptions,
  TRendererOptions,
> {
  /**
   * Renders a translated document into a final output format.
   *
   * @returns An Effect that yields the rendered document, or fails with a DocumentBuilderError.
   */
  render: (
    context: TContext,
    document: TranslatedDocument,
    options: TOptions | undefined,
    rendererOptions: TRendererOptions | undefined,
  ) => Effect.Effect<RenderedDocument, DocumentBuilderError>
}

type RenderedDocument =
  | {
      type: 'text'
      content: string
    }
  | {
      type: 'binary'
      content: Uint8Array
    }

interface FilepathResolver {
  resolve: (project: ProjectContext, language: LanguageCodes) => string
}
