import { Schema } from 'effect'

/**
 * Defines a schema for the supported TypeScript type sources, specifically 'typescript' or 'effect-schema'.
 */
export const TypeSource = Schema.Literals(['typescript', 'effect-schema'])

/**
 * Represents the inferred TypeScript type for the TypeSource schema.
 */
export type TypeSource = Schema.Schema.Type<typeof TypeSource>
