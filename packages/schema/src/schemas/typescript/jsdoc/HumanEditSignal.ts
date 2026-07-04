import { Schema } from 'effect'

export const HumanEditSignal = Schema.Struct({
  type: Schema.Literals([
    'manual-format',
    'custom-section',
    'non-generated-tag',
    'complex-markdown',
    'custom-example',
  ]).annotate({
    description: 'The category of the manual edit detected.',
  }),

  score: Schema.Number.annotate({
    description: 'A score representing the confidence or weight of the detected signal.',
  }),

  details: Schema.Struct({
    pattern: Schema.optional(
      Schema.String.annotate({
        description: 'A pattern identifier associated with the detected modification.',
      }),
    ),

    source: Schema.optional(
      Schema.String.annotate({
        description: 'The source identifier indicating where the edit originated.',
      }),
    ),

    targetSection: Schema.String.annotate({
      description: 'The section name where the human modification was applied.',
    }),
  }),
}).annotate({
  description:
    'Represents a detected modification made to documentation that was not automatically generated.',
})

export type HumanEditSignal = Schema.Schema.Type<typeof HumanEditSignal>

export const HumanEditContext = Schema.Struct({
  source: Schema.Literals(['summary', 'remarks', 'example', 'tag']).annotate({
    description: 'The JSDoc section or tag type being edited.',
  }),

  tagName: Schema.optional(
    Schema.String.annotate({
      description: 'The specific tag name if the source is a tag.',
    }),
  ),
}).annotate({
  description:
    'Contextual information about a specific location in documentation where human edits might occur.',
})

export type HumanEditContext = Schema.Schema.Type<typeof HumanEditContext>
