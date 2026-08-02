import type { ConceptOptions } from '../ConceptOptions.js'
import type { Effect, FileSystem } from 'effect'
import type { DocumentBaseContext } from '@gyomu/schema/concept'
import type { LanguageCodes } from '@gyomu/schema/schemas/document'
import type { SectionBuilder } from './builder/SectionBuilder.js'
import type { DocumentBuilderError } from '../error/DocumentBuilderError.js'
import type { TranslatedDocument } from './translation/TranslatedDocument.js'
import type { ProjectContext } from '@gyomu/ts-analysis'
import type { FileSearchService } from '@gyomu/schema/shared/fs'

export interface DocumentDefinition<
  TSectionId extends string,
  TContext extends DocumentBaseContext,
  TOptions extends ConceptOptions,
  TRendererOptions = never,
> {
  createContext: (
    project: ProjectContext,
    option?: TOptions,
  ) => Effect.Effect<TContext, DocumentBuilderError, FileSystem.FileSystem | FileSearchService>

  supportedLanguages: ReadonlyArray<LanguageCodes>

  sectionBuilders: ReadonlyArray<SectionBuilder<TSectionId, TContext, any>>

  output: DocumentOutput<TContext, TOptions, TRendererOptions>

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

export interface DocumentRenderer<
  TContext extends DocumentBaseContext,
  TOptions extends ConceptOptions,
  TRendererOptions,
> {
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
