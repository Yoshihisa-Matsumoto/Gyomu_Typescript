import { Schema } from 'effect'

export const DirectoryConcept = Schema.Struct({
  summary: Schema.String.annotate({
    description:
      'Describe the overall architectural purpose of this directory in 100-300 characters.',
  }),

  responsibilities: Schema.Array(Schema.String).annotate({
    description:
      'List the primary responsibilities owned by this directory. Describe what this directory does, not how it is implemented.',
  }),

  concepts: Schema.Array(Schema.String).annotate({
    description:
      'List the important domain or architectural concepts represented by this directory. Prefer nouns or noun phrases.',
  }),

  relationships: Schema.Array(Schema.String).annotate({
    description:
      'Describe important relationships between concepts in complete sentences. Explain how concepts interact rather than simply listing them.',
  }),

  designDecisions: Schema.Array(Schema.String).annotate({
    description:
      'List significant architectural decisions, design patterns, layering, dependency direction, immutability, caching, or other notable implementation strategies.',
  }),
})

export type DirectoryConcept = Schema.Schema.Type<typeof DirectoryConcept>
