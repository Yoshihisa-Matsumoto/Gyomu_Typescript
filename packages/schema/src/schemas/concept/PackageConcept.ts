import { Schema } from 'effect'
import { PackageInsightSchema } from './PackageInsight.js'

export const PackageDependencySchema = Schema.Struct({
  packageName: Schema.String,
  source: Schema.Literals(['dependency', 'devDependency', 'peerDependency', 'optionalDependency']),
  version: Schema.String,
})

export const PackageInfoSchema = Schema.Struct({
  name: Schema.String,
  version: Schema.String,
  private: Schema.Boolean,
  type: Schema.Literals(['module', 'commonjs']),
  description: Schema.optional(Schema.String),
})

export const PublicApiSymbolSchema = Schema.Struct({
  name: Schema.String,
  kind: Schema.String,
  summary: Schema.String,
})

export const PublicApiSchema = Schema.Struct({
  exportPath: Schema.String,

  symbols: Schema.Array(PublicApiSymbolSchema),
})

export const PackageConceptSchema = Schema.Struct({
  packageInfo: PackageInfoSchema,
  publicApi: Schema.Array(PublicApiSchema).annotate({
    description:
      'Most important public APIs exposed by this package. Include only the key exported symbols that consumers are expected to use.',
  }),
  dependencies: Schema.Array(PackageDependencySchema),
}).pipe(Schema.fieldsAssign(PackageInsightSchema.fields))

export type PackageConcept = Schema.Schema.Type<typeof PackageConceptSchema>
export type PublicApi = Schema.Schema.Type<typeof PublicApiSchema>
export type PackageInfo = Schema.Schema.Type<typeof PackageInfoSchema>
export type PackageDependency = Schema.Schema.Type<typeof PackageDependencySchema>
