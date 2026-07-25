import type { PackageConcept } from '../../schemas/concept/PackageConcept.js'
import type { Development, Package, Roadmap, Technical } from '../../schemas/knowledge/index.js'
import type { PackageAnalysis } from '../package/PackageAnalysis.js'

export interface ReadmeBuildContext {
  analysis: PackageAnalysis

  concept: PackageConcept

  knowledge: {
    package: Package

    technical: Technical

    development: Development

    roadmap: Roadmap | undefined
  }
}
