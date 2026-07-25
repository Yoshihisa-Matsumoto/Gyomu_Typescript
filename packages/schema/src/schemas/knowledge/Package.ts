import { Schema } from 'effect'

export const Package = Schema.Struct({
  displayName: Schema.String.annotate({ description: 'Package display name' }),

  mission: Schema.String.annotate({
    description:
      'The primary mission or purpose of this knowledge. Explain what this knowledge exists to achieve in one concise paragraph.',
  }),

  policies: Schema.Array(
    Schema.String.annotate({
      description: 'A single policy or guideline that should normally be followed.',
    }),
  ).annotate({
    description:
      'General principles or recommended behaviors. These describe what should usually be done, but are not absolute requirements.',
  }),

  constraints: Schema.Array(
    Schema.String.annotate({
      description: 'A single mandatory constraint or requirement.',
    }),
  ).annotate({
    description:
      'Hard requirements that must always be satisfied. Violating these constraints makes the output incorrect.',
  }),

  nonGoals: Schema.Array(
    Schema.String.annotate({
      description: 'A single thing that is intentionally outside the scope of this knowledge.',
    }),
  ).annotate({
    description:
      'Explicitly state what this knowledge is not intended to solve or cover. This helps avoid scope creep and incorrect assumptions.',
  }),

  terminology: Schema.Array(
    Schema.Struct({
      term: Schema.String.annotate({
        description: 'The technical term or concept.',
      }),

      definition: Schema.String.annotate({
        description: 'A concise explanation of the meaning of the term within this project.',
      }),
    }).annotate({
      description: 'A glossary entry.',
    }),
  ).annotate({
    description:
      'Definitions of project-specific terminology. Include only terms that may be ambiguous or unfamiliar.',
  }),

  rationale: Schema.Array(
    Schema.String.annotate({
      description: 'Explain one design decision and why it exists.',
    }),
  ).annotate({
    description:
      'Important reasoning behind decisions, trade-offs, or architectural choices. Focus on "why" rather than "what".',
  }),

  usage: Schema.Array(
    Schema.Struct({
      situation: Schema.String.annotate({
        description: 'Describe the context or situation in which this guidance should be applied.',
      }),

      guidance: Schema.String.annotate({
        description:
          'Explain the recommended action, behavior, or workflow that should be followed in this situation.',
      }),
    }).annotate({
      description:
        'One recommended usage pattern consisting of a situation and the corresponding guidance.',
    }),
  ).annotate({
    description:
      'Recommended ways to apply this knowledge in practice. Each entry describes when the guidance applies and what should be done.',
  }),

  examples: Schema.Array(
    Schema.Struct({
      title: Schema.String.annotate({
        description: 'A short descriptive title that summarizes the example.',
      }),

      input: Schema.String.annotate({
        description:
          'The input, request, or initial situation presented to the system. Use Markdown when formatting improves readability.',
      }),

      output: Schema.String.annotate({
        description:
          'The expected or recommended output produced from the input. Use Markdown when appropriate.',
      }),

      explanation: Schema.String.annotate({
        description:
          'Explain why this output is considered correct and what principle or policy it demonstrates.',
      }),
    }).annotate({
      description: 'A complete worked example demonstrating how this knowledge should be applied.',
    }),
  ).annotate({
    description:
      'Concrete examples showing correct application of this knowledge. Examples should be realistic, representative, and suitable for few-shot prompting.',
  }),
}).annotate({
  title: 'Knowledge',
  description:
    'Structured knowledge provided to an LLM. It defines the mission, expected behaviors, limitations, terminology, rationale, recommended usage, and practical examples for a specific topic.',
})

export type Package = Schema.Schema.Type<typeof Package>
