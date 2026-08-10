import { join } from 'node:path'
import { Effect } from 'effect'
import { README_SECTION_BUILDERS } from './builder/builder.js'
import { renderReadmeMarkdown } from './render/renderReadmeMarkdown.js'
import { getReadmeFileName } from './internal/getReadmeFileName.js'
import { initializeReadmeBuildContext } from './initializeReadmeBuildContext.js'
import type { ConceptOptions } from '../ConceptOptions.js'
import type { DocumentDefinition, DocumentRenderer } from '../document/DocumentDefinition.js'
import type { ReadmeBuildContext, ReadmeSectionId } from '@gyomu/schema/concept'

/**
 * A document renderer that produces Markdown content for README files, utilizing context and specific concept options.
 */
export const ReadmeMarkdownRenderer: DocumentRenderer<
  ReadmeBuildContext,
  ConceptOptions,
  ReadmeMarkdownRendererOptions
> = {
  render: (context, document, options, rendererOptions) => {
    return Effect.succeed({
      type: 'text',
      content: renderReadmeMarkdown(context, document, options, rendererOptions?.needLink ?? false),
    })
  },
}

interface ReadmeMarkdownRendererOptions {
  needLink?: boolean
}

/**
 * The formal definition for a README document, specifying the build context initialization, supported languages, section construction, and output rendering strategy.
 */
export const README_DOCUMENT_DEFINITION: DocumentDefinition<
  ReadmeSectionId,
  ReadmeBuildContext,
  ConceptOptions,
  ReadmeMarkdownRendererOptions
> = {
  createContext: (project, option) => initializeReadmeBuildContext(project, option),

  supportedLanguages: ['en', 'ja'],

  sectionBuilders: README_SECTION_BUILDERS,

  output: {
    renderer: ReadmeMarkdownRenderer,
    filepathResolver: {
      resolve: (project, language) => {
        const readmeFilename = getReadmeFileName(language)

        return join(project.projectRoot, readmeFilename)
      },
    },
  },

  rendererOptions: {
    needLink: true,
  },
}
