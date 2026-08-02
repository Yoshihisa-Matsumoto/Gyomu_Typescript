import type { Schema } from 'effect'
import type { CapabilityConceptSchema } from '@gyomu/schema/schemas/concept'

export interface ConstraintsInput {
  humanConstraints: ReadonlyArray<string>

  packageFacts: {
    responsibilities: ReadonlyArray<string>
    capabilities: ReadonlyArray<Schema.Schema.Type<typeof CapabilityConceptSchema>>
  }

  dependencyFacts: {
    runtimeDependencies: Array<string>
  }

  publicApiFacts: {
    exportPaths: Array<string>
    exportedSymbolCount: number
  }

  architectureFacts: ReadonlyArray<{
    directory: string
    responsibilities: ReadonlyArray<string>
    relationships: ReadonlyArray<string>
    designDecisions: ReadonlyArray<string>
  }>
}
