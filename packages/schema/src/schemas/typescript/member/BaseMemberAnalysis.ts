import { Schema } from 'effect'
import { SymbolIdentity } from '../SymbolIdentity.js'
import { MemberAccessor } from '../MemberAccessor.js'

export const BaseMemberAnalysis = Schema.Struct({
  id: Schema.String.pipe(Schema.brand('SymbolId')).annotate({
    title: 'Symbol identifier',

    description: 'Stable identifier of the symbol.',

    documentation: `
This identifier must remain stable across repeated analyses of the same source code.

It is used as a correlation key for generated documentation, merge operations,
snapshots, and other analysis artifacts.

Recommended format:

<relative-file-path>::<qualified-symbol-name>

Example:

src/user/UserService.ts::UserService.getUser
`,
  }),
  ownerSymbolId: Schema.String.pipe(Schema.brand('SymbolId')),
  identity: SymbolIdentity,
  name: Schema.String,
  static: Schema.Boolean,
  visibility: MemberAccessor,
  declarationOrder: Schema.Number,
})

export type BaseMemberAnalysis = Schema.Schema.Type<typeof BaseMemberAnalysis>
