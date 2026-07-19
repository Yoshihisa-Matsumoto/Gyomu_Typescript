import { Schema } from 'effect'
import { PackageInsightSchema } from './PackageInsight.js'

/**
 * Defines a schema for a package dependency, including the package name, the type of dependency, and the version range.
 */
export const PackageDependencySchema = Schema.Struct({
  packageName: Schema.String,
  source: Schema.Literals(['dependency', 'devDependency', 'peerDependency', 'optionalDependency']),
  version: Schema.String,
})

/**
 * Defines the core metadata for a package, including its name, version, privacy status, module type, and an optional description.
 */
export const PackageInfoSchema = Schema.Struct({
  name: Schema.String,
  version: Schema.String,
  private: Schema.Boolean,
  type: Schema.Literals(['module', 'commonjs']),
  description: Schema.optional(Schema.String),
})

/**
 * Defines a schema for an individual public API symbol, containing its name, kind, and a brief summary.
 */
export const PublicApiSymbolSchema = Schema.Struct({
  name: Schema.String,
  kind: Schema.String,
  summary: Schema.String,
})

/**
 * Defines a schema for a package's public API, mapping an export path to an array of documented symbols.
 */
export const PublicApiSchema = Schema.Struct({
  exportPath: Schema.String,

  symbols: Schema.Array(PublicApiSymbolSchema),
})

/**
 * Defines the comprehensive package concept schema, integrating package metadata, key public APIs, dependencies, and additional package insights.
 */
export const PackageConceptSchema = Schema.Struct({
  packageInfo: PackageInfoSchema,
  publicApi: Schema.Array(PublicApiSchema).annotate({
    description:
      'Most important public APIs exposed by this package. Include only the key exported symbols that consumers are expected to use.',
  }),
  dependencies: Schema.Array(PackageDependencySchema),
}).pipe(Schema.fieldsAssign(PackageInsightSchema.fields))

/**
 * The inferred type for the PackageConcept schema.
 */
export type PackageConcept = Schema.Schema.Type<typeof PackageConceptSchema>

/**
 * The inferred type for the PublicApi schema.
 */
export type PublicApi = Schema.Schema.Type<typeof PublicApiSchema>

/**
 * The inferred type for the PackageInfo schema.
 */
export type PackageInfo = Schema.Schema.Type<typeof PackageInfoSchema>

/**
 * The inferred type for the PackageDependency schema.
 */
export type PackageDependency = Schema.Schema.Type<typeof PackageDependencySchema>
