import { Schema } from 'effect'

export const FailureSchema = Schema.Struct({
  success: Schema.Literal(false),

  error: Schema.String,
})

export const createSuccessSchema = <T extends Schema.Schema<any>>(dataSchema: T) =>
  Schema.Struct({
    success: Schema.Literal(true),

    data: dataSchema,
  })

export const createResultSchema = <T extends Schema.Schema<any>>(dataSchema: T) =>
  Schema.Union([createSuccessSchema(dataSchema), FailureSchema])
