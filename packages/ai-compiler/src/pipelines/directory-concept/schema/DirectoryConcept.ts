import { Schema } from 'effect'

export const DirectoryConceptSchema = Schema.Struct({
  summary: Schema.String.annotate({
    description: 'Summarize the overall responsibility of this directory in 100-300 characters.',
  }),

  responsibilities: Schema.Array(Schema.String).annotate({
    description: 'List the primary responsibilities implemented by this directory.',
  }),

  concepts: Schema.Array(Schema.String).annotate({
    description: 'List the important domain concepts represented in this directory.',
  }),

  relationships: Schema.Array(Schema.String).annotate({
    description: 'Describe important relationships between concepts inside this directory.',
  }),

  designDecisions: Schema.Array(Schema.String).annotate({
    description: 'List important design decisions or architectural characteristics.',
  }),
})

export type DirectoryConcept = Schema.Schema.Type<typeof DirectoryConceptSchema>
