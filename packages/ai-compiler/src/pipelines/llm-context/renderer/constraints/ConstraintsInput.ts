import type { Schema } from 'effect'
import type { CapabilityConceptSchema } from '@gyomu/schema/schemas/concept'

/**
 * Represents the input constraints containing human constraints, package facts, dependency facts, public API facts, and architecture facts.
 */
export interface ConstraintsInput {
  /**
   * Human-defined constraints.
   */
  humanConstraints: ReadonlyArray<string>

  /**
   * Package facts including responsibilities and capabilities.
   */
  packageFacts: {
    /**
     * Package responsibilities.
     */
    responsibilities: ReadonlyArray<string>

    /**
     * Package capabilities.
     */
    capabilities: ReadonlyArray<Schema.Schema.Type<typeof CapabilityConceptSchema>>
  }

  /**
   * Dependency facts including runtime dependencies.
   */
  dependencyFacts: {
    /**
     * List of runtime dependencies.
     */
    runtimeDependencies: Array<string>
  }

  /**
   * Public API facts including export paths and exported symbol count.
   */
  publicApiFacts: {
    /**
     * Export paths for the public API.
     */
    exportPaths: Array<string>

    /**
     * Count of exported symbols.
     */
    exportedSymbolCount: number
  }

  /**
   * Architecture facts detailing directories, responsibilities, relationships, and design decisions.
   */
  architectureFacts: ReadonlyArray<{
    directory: string
    responsibilities: ReadonlyArray<string>
    relationships: ReadonlyArray<string>
    designDecisions: ReadonlyArray<string>
  }>
}
