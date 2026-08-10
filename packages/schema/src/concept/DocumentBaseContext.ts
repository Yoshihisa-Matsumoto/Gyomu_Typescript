import type { Development } from '../schemas/knowledge/Development.js'
import type { PackageConcept } from '../schemas/concept/PackageConcept.js'
import type { Package } from '../schemas/knowledge/Package.js'
import type { Roadmap } from '../schemas/knowledge/Roadmap.js'
import type { Technical } from '../schemas/knowledge/Technical.js'
import type { PackageAnalysis } from './package/PackageAnalysis.js'

/**
 * Defines the context required for generating a package README, including package analysis, conceptual overview, and foundational knowledge.
 */
export interface DocumentBaseContext {
  /**
   * The analysis of the package.
   */
  analysis: PackageAnalysis

  /**
   * The conceptual model of the package.
   */
  concept: PackageConcept

  /**
   * Foundational knowledge required for documentation, including package metadata, technical details, development status, and roadmap.
   */
  knowledge: {
    /**
     * General information about the package.
     */
    package: Package

    /**
     * Technical specifications and details of the package.
     */
    technical: Technical

    /**
     * Development-related information for the package.
     */
    development: Development

    /**
     * The optional development roadmap for the package.
     */
    roadmap: Roadmap | undefined
  }
}
