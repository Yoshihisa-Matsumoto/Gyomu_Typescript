import { Schema } from 'effect'

export const ImportKind = Schema.Literals(['named', 'default', 'namespace']).annotate({
  description: 'The type of import, categorized as named, default, or namespace.',
})

export type ImportKind = Schema.Schema.Type<typeof ImportKind>

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

export type ImportAnalysis = Schema.Schema.Type<typeof ImportAnalysis>
