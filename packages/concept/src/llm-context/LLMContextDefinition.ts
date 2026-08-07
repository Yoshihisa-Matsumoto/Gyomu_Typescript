import { join } from 'node:path'
import { Effect } from 'effect'
import { LLMCONTEXT_SECTION_BUILDERS } from './builder/builder.js'
import { renderLlmContextMarkdown } from './render/renderLlmContextMarkdown.js'
import { initializeLlmContextBuildContext } from './initializeLlmContextBuildContext.js'
import type { ConceptOptions } from '../ConceptOptions.js'
import type { DocumentDefinition, DocumentRenderer } from '../document/DocumentDefinition.js'
import type { LlmContextBuildContext, LlmContextSectionId } from '@gyomu/schema/concept'

export const LlmContextMarkdownRenderer: DocumentRenderer<
  LlmContextBuildContext,
  ConceptOptions,
  ConceptOptions
> = {
  render: (context, document, options) => {
    return Effect.succeed({
      type: 'text',
      content: renderLlmContextMarkdown(context, document, options, false),
    })
  },
}

export const LLMCONTEXT_DOCUMENT_DEFINITION: DocumentDefinition<
  LlmContextSectionId,
  LlmContextBuildContext,
  ConceptOptions
> = {
  createContext: (project, option) => initializeLlmContextBuildContext(project, option),

  supportedLanguages: ['en'],

  sectionBuilders: LLMCONTEXT_SECTION_BUILDERS,

  output: {
    renderer: LlmContextMarkdownRenderer,
    filepathResolver: {
      resolve: (project, language) => {
        const readmeFilename = 'Context.md'

        return join(project.projectRoot, readmeFilename)
      },
    },
  },
}
