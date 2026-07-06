import { Schema } from 'effect'
import { GeneratorMarker } from './GeneratorMarker.js'

/**
 * Existing JSDoc/TSDoc quality analysis, including metrics on documentation presence, tag counts, and human-edited indicators.
 */
export const JsDocAnalysis = Schema.Struct({
  exists: Schema.Boolean.annotate({
    description: 'Whether documentation exists.',
  }),

  summaryLength: Schema.Number.annotate({
    description: 'Length of the summary description.',
  }),

  hasSummary: Schema.Boolean.annotate({
    description: 'Whether a summary description exists.',
  }),

  hasRemarks: Schema.Boolean.annotate({
    description: 'Whether a @remarks section exists.',
  }),

  exampleCount: Schema.Number.annotate({
    description: 'Count of @example section.',
  }),

  hasDeprecated: Schema.Boolean.annotate({
    description: 'Whether a @deprecated tag exists.',
  }),

  paramCount: Schema.Number.annotate({
    description: 'Count of parameter tags.',
  }),

  hasReturnTag: Schema.Boolean.annotate({
    description: 'Whether a @returns tag exists.',
  }),

  throwsCount: Schema.Number.annotate({
    description: 'Count of @throws tag.',
  }),

  templateCount: Schema.Number.annotate({
    description: 'Count of @template tag.',
  }),

  tagCount: Schema.Number.annotate({
    description: 'Total tag count.',
  }),

  qualityScore: Schema.optional(
    Schema.Number.annotate({
      description: 'Estimated documentation quality score.',
    }),
  ),

  hasHumanEditedSections: Schema.Boolean.annotate({
    description: `Whether the documentation contains sections
that appear to have been manually edited by a human.

Used to reduce aggressive overwrites during
automated TSDoc updates.`,
  }),

  hasProtectedRegion: Schema.Boolean.annotate({
    description: `Whether the documentation contains explicitly
protected regions that must not be modified
by automated tools.

Protected regions may use markers such as:

<!-- tsdoc-preserve-start -->
<!-- tsdoc-preserve-end -->`,
  }),

  generators: Schema.Array(GeneratorMarker).annotate({
    description: `Generators that originally created or modified the documentation.`,
  }),
}).annotate({
  description: 'Existing JSDoc/TSDoc quality analysis.',
})

/**
 * The TypeScript type for the JsDocAnalysis schema.
 */
export type JsDocAnalysis = Schema.Schema.Type<typeof JsDocAnalysis>
