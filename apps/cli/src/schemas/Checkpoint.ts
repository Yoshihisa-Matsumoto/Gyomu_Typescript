import { Schema } from 'effect'

export const PipelineStep = Schema.Literals([
  'directoryConcept',
  'packageConcept',
  'README',
  'LLMContext',
])
export const Checkpoint = Schema.Struct({
  version: Schema.Literal(1),
  package: Schema.String,
  snapshotVersion: Schema.Number,
  completedSteps: Schema.Array(PipelineStep),
})

export type PipelineStep = Schema.Schema.Type<typeof PipelineStep>
export type Checkpoint = Schema.Schema.Type<typeof Checkpoint>
