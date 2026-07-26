import { Schema } from 'effect'

/**
 * One roadmap item describing a planned improvement or feature.
 */
export const RoadmapItem = Schema.Struct({
  title: Schema.String.annotate({
    description: 'A short title summarizing the planned work.',
  }),

  description: Schema.String.annotate({
    description: 'Explain the purpose, expected outcome, or motivation for this work.',
  }),

  priority: Schema.Literals(['high', 'medium', 'low']).annotate({
    description:
      'Relative implementation priority. High-priority items are expected to be addressed before lower-priority items.',
  }),
}).annotate({
  title: 'RoadmapItem',
  description: 'One roadmap item describing a planned improvement or feature.',
})

/**
 * Tracks the implementation status of planned work for this package. It is intended to communicate current priorities and future direction rather than detailed task management.
 */
export const Roadmap = Schema.Struct({
  planned: Schema.Array(RoadmapItem).annotate({
    description: 'Work that has been approved or planned but has not yet started.',
  }),

  inProgress: Schema.Array(RoadmapItem).annotate({
    description: 'Work that is currently being implemented.',
  }),

  completed: Schema.Array(RoadmapItem).annotate({
    description:
      'Completed work that is worth documenting because it influences future development.',
  }),

  backlog: Schema.Array(RoadmapItem).annotate({
    description:
      'Ideas or requests that may be implemented in the future but are not currently planned.',
  }),
}).annotate({
  title: 'Roadmap',
  description:
    'Tracks the implementation status of planned work for this package. It is intended to communicate current priorities and future direction rather than detailed task management.',
})

/**
 * The inferred type of the Roadmap schema.
 */
export type Roadmap = Schema.Schema.Type<typeof Roadmap>
