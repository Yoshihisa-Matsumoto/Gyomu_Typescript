import { Result, Schema } from 'effect'
import type { GyomuError } from '../error/GyomuError.js'

export const PublicErrorSchema = Schema.Struct({
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
export type ResultSchemaType<T extends Schema.Schema<any>> =
  | {
      readonly success: true
      readonly data: Schema.Schema.Type<T>
    }
  | {
      readonly success: false
      readonly error: PublicError
    }
export type ToolResult<T> =
  | {
      readonly success: true
      readonly data: T
    }
  | {
      readonly success: false
      readonly error: PublicError
    }

export const executePublicApiWithSchema = async <T extends Schema.Schema<any>>(
  dataSchema: T,
  effectResult: () => Promise<Result.Result<Schema.Schema.Type<T>, GyomuError>>,
  mapError: (error: GyomuError) => PublicError,
): Promise<ResultSchemaType<T>> => {
  const result = await effectResult()
  if (Result.isSuccess(result)) {
    return {
      success: true as const,
      data: result.success,
    }
  } else {
    return {
      success: false as const,
      error: mapError(result.failure),
    }
  }
}

export const executeStreamingPublicApi = async (
  effectResult: () => Promise<Result.Result<Response, GyomuError>>,
  mapError: (error: GyomuError) => PublicError,
) => {
  const result = await effectResult()
  if (Result.isSuccess(result)) {
    return result.success
  } else {
    const publicError = mapError(result.failure)
    return Response.json(publicError, { status: 500 })
  }
}
