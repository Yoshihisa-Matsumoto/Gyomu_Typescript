import { Schema } from 'effect'

/**
 * Defines the categorization of an import as either named, default, or namespace.
 */
export const ImportKind = Schema.Literals(['named', 'default', 'namespace']).annotate({
  description: 'The type of import, categorized as named, default, or namespace.',
})

/**
 * The inferred type of ImportKind.
 */
export type ImportKind = Schema.Schema.Type<typeof ImportKind>

/**
 * Represents an analyzed import declaration, containing the module specifier, import kind, names, and type-only flag.
 */
export const ImportAnalysis = Schema.Struct({
  moduleSpecifier: Schema.String.annotate({
    description: `The raw module specifier text.

@example
'./userRepository'`,
  }),

  kind: ImportKind,

  importedName: Schema.String.annotate({
    description: 'The name of the symbol in the source module.',
  }),

  localName: Schema.String.annotate({
    description: 'The name of the symbol in the local scope.',
  }),

  isTypeOnly: Schema.Boolean.annotate({
    description: 'Whether this is a type-only import.',
  }),
}).annotate({
  description: 'Represents an analyzed import declaration.',
})

/**
 * The inferred type of ImportAnalysis.
 */
export type ImportAnalysis = Schema.Schema.Type<typeof ImportAnalysis>
