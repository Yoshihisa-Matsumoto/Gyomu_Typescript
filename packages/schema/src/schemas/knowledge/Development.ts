import { Schema } from 'effect'

export const Development = Schema.Struct({
  faq: Schema.Array(
    Schema.Struct({
      question: Schema.String.annotate({
        description: 'A frequently asked question.',
      }),

      answer: Schema.String.annotate({
        description: 'The recommended answer.',
      }),
    }),
  ).annotate({
    description: 'Frequently asked questions for developers.',
  }),

  knownIssues: Schema.Array(
    Schema.Struct({
      issue: Schema.String.annotate({
        description: 'Describe the known issue.',
      }),

      workaround: Schema.optional(
        Schema.String.annotate({
          description: 'Temporary workaround if available.',
        }),
      ),
    }),
  ).annotate({
    description: 'Known limitations or unresolved issues.',
  }),

  tips: Schema.Array(
    Schema.Struct({
      title: Schema.String.annotate({
        description: 'Short title of the development tip.',
      }),

      description: Schema.String.annotate({
        description: 'Explain the recommendation or best practice.',
      }),
    }),
  ).annotate({
    description: 'Helpful recommendations that improve development experience.',
  }),
}).annotate({
  title: 'Development',
  description:
    'Developer-oriented operational knowledge including FAQ, known issues, and practical tips.',
})

export type Development = Schema.Schema.Type<typeof Development>
