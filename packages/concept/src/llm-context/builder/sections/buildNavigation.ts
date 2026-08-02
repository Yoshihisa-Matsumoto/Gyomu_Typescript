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

* **Architecture Documentation**
  Describes the internal architecture, major components, dependencies, and design decisions of this package.

* **API Reference**
  Describes public APIs, exported modules, and usage patterns.

* **Development Guide**
  Describes development workflows, coding conventions, testing strategies, and contribution guidelines.

* **Technical Documentation**
  Describes technical details, configuration, dependencies, and implementation-specific information.

* **Project Knowledge**
  Contains additional knowledge maintained by developers, including constraints, rationale, terminology, and operational guidelines.

When modifying this package, review the relevant documentation before making changes to preserve the intended responsibilities and architectural boundaries.
`,
          },
        ],
      } satisfies Section,
    })
  },
  enabled: () => true,
}
