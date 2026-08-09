import { Effect } from 'effect'
import type { SectionBuilder } from '../../../document/builder/SectionBuilder.js'
import type { ConceptOptions } from '../../../ConceptOptions.js'
import type { LlmContextBuildContext, LlmContextSectionId } from '@gyomu/schema/concept'
import type { Section } from '@gyomu/schema/schemas/document'

export const buildNavigation: SectionBuilder<LlmContextSectionId, LlmContextBuildContext, never> = {
  id: 'navigation',

  build: (context: LlmContextBuildContext, option?: ConceptOptions) => {
    return Effect.succeed({
      section: {
        id: 'navigation',
        title: undefined,
        contents: [
          {
            type: 'paragraph',
            text: `This document provides a high-level overview of the package concept, responsibilities, and design decisions.

For more detailed information, refer to the following documents:

`,
          },
          {
            type: 'bullet-list',
            items: [
              {
                translationId: 1,
                text: `**Architecture Documentation**
  Describes the internal architecture, major components, dependencies, and design decisions of this package.`,
              },
              {
                translationId: 2,
                text: `**API Reference**
  Describes public APIs, exported modules, and usage patterns.
`,
              },
              {
                translationId: 3,
                text: `**Technical Documentation**
  Describes technical details, configuration, dependencies, and implementation-specific information.
`,
              },
              {
                translationId: 4,
                text: `**Development Guide**
  Describes development workflows, coding conventions, testing strategies, and contribution guidelines.
`,
              },
              {
                translationId: 5,
                text: `**Project Knowledge**
  Contains additional knowledge maintained by developers, including constraints, rationale, terminology, and operational guidelines.
`,
              },
            ],
          },
          {
            type: 'paragraph',
            text: `When modifying this package, review the relevant documentation before making changes to preserve the intended responsibilities and architectural boundaries.
`,
          },
        ],
      } satisfies Section,
    })
  },
  translation: { strategy: 'none' },
  enabled: () => true,
}
