import { Schema } from 'effect'

export const Installation = Schema.Struct({
  command: Schema.String.annotate({
    description: 'The command required to install or set up this package.',
  }),

  description: Schema.String.annotate({
    description: 'Explain when or why this installation step is required.',
  }),
}).annotate({
  title: 'Installation',
  description: 'One installation or setup step required before using this package.',
})

export const Dependency = Schema.Struct({
  package: Schema.String.annotate({
    description: 'The package name or dependency identifier.',
  }),

  description: Schema.String.annotate({
    description: 'Explain why this dependency exists and how it is used within this package.',
  }),
}).annotate({
  title: 'Dependency',
  description: 'Describes one important dependency that developers should be aware of.',
})

export const Compatibility = Schema.Struct({
  name: Schema.String.annotate({
    description:
      'The technology, runtime, library, or platform this compatibility note applies to.',
  }),

  supported: Schema.String.annotate({
    description: 'Describe the supported version, platform, or compatibility requirement.',
  }),

  description: Schema.optional(
    Schema.String.annotate({
      description: 'Additional notes about compatibility, limitations, or recommendations.',
    }),
  ),
}).annotate({
  title: 'Compatibility',
  description: 'Describes one compatibility requirement or supported environment.',
})

export const Technical = Schema.Struct({
  installation: Schema.Array(Installation).annotate({
    description:
      'Instructions for installing or enabling this package. Include only information that is required by developers.',
  }),

  configuration: Schema.Array(
    Schema.Struct({
      key: Schema.String.annotate({
        description: 'Configuration key, option name, or environment variable.',
      }),

      description: Schema.String.annotate({
        description: 'Explain the purpose of this configuration item.',
      }),

      defaultValue: Schema.optional(
        Schema.String.annotate({
          description: 'Default value if one exists.',
        }),
      ),
    }).annotate({
      description: 'One configuration item.',
    }),
  ).annotate({
    description: 'Configuration options supported by this package.',
  }),

  dependencies: Schema.Array(Dependency).annotate({
    description:
      'Important runtime, build-time, or peer dependencies that users of this package should know about.',
  }),

  compatibility: Schema.Array(Compatibility).annotate({
    description:
      'Supported runtimes, libraries, module systems, and other compatibility information.',
  }),

  migration: Schema.Array(
    Schema.Struct({
      version: Schema.String.annotate({
        description: 'Version where the migration became necessary.',
      }),

      description: Schema.String.annotate({
        description: 'Explain the migration and required changes.',
      }),
    }).annotate({
      description: 'One migration note.',
    }),
  ).annotate({
    description: 'Migration guides for breaking or important changes.',
  }),
}).annotate({
  title: 'Technical',
  description: 'Technical reference for installing, configuring, and integrating this package.',
})

export type Technical = Schema.Schema.Type<typeof Technical>
