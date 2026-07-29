import type { PackageConcept } from '../schemas/concept/PackageConcept.js'
import type { Package } from '../schemas/knowledge/Package.js'
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
  }
}
