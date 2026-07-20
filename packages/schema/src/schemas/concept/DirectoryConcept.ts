import { Schema } from 'effect'

/**
 * Defines a schema for capturing the architectural intent and conceptual structure of a project directory, including its purpose, responsibilities, core concepts, relationships, and design decisions.
 */
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

  importance: Schema.Literals(['Core', 'Supporting', 'Utility']).annotate({
    description: `Indicates how essential this directory is to the package's primary purpose.

Choose:
- Core: This directory represents one of the primary reasons the package exists. Without it, the package would lose its core identity.
- Supporting: This directory mainly supports or extends the core functionality but is not itself the primary purpose of the package.
- Utility: This directory provides auxiliary or reusable helper functionality. It is useful but not essential for understanding the package's main responsibility.

Classify based on the package's overall purpose, not on implementation size, number of files, or complexity.
`,
  }),
})

/**
 * The inferred TypeScript type for a DirectoryConcept schema.
 */
export type DirectoryConcept = Schema.Schema.Type<typeof DirectoryConcept>
