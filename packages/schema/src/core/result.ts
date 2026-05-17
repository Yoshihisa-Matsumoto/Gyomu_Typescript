import { Schema } from 'effect'

const PublicErrorSchema = Schema.Struct({
  code: Schema.String,
  message: Schema.String,
  retryable: Schema.Boolean,
})
export type PublicError = Schema.Schema.Type<typeof PublicErrorSchema>

export const FailureSchema = Schema.Struct({
  success: Schema.Literal(false),

  error: PublicErrorSchema,
})

export const createSuccessSchema = <T extends Schema.Schema<any>>(dataSchema: T) =>
  Schema.Struct({
    success: Schema.Literal(true),

    data: dataSchema,
  })

export const createResultSchema = <T extends Schema.Schema<any>>(dataSchema: T) =>
  Schema.Union([createSuccessSchema(dataSchema), FailureSchema])
