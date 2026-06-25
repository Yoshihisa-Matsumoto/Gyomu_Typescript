import { Result, Schema } from 'effect'
import type { GyomuError } from '../error/GyomuError.js'

/**
 * Defines a public error response containing an error code, message, and a retryability indicator.
 */
export const PublicErrorSchema = Schema.Struct({
  code: Schema.String,
  message: Schema.String,
  retryable: Schema.Boolean,
})

/**
 * Represents a public-facing error derived from the PublicErrorSchema.
 */
export type PublicError = Schema.Schema.Type<typeof PublicErrorSchema>

/**
 * Defines a failure result schema containing a boolean success indicator set to false and a public error object.
 */
export const FailureSchema = Schema.Struct({
  success: Schema.Literal(false),

  error: PublicErrorSchema,
})

/**
 * Creates a success response schema containing a literal true success flag and a nested data schema.
 *
 * @param dataSchema The schema definition for the success data payload.
 *
 * @returns A schema object with a `success: true` property and the provided `data` schema.
 */
export const createSuccessSchema = <T extends Schema.Schema<any>>(dataSchema: T) =>
  Schema.Struct({
    success: Schema.Literal(true),

    data: dataSchema,
  })

/**
 * Creates a result schema that represents either a successful operation containing the provided data schema or a generic failure response.
 *
 * @param dataSchema The schema definition for the successful result data.
 *
 * @returns A union schema consisting of the successful result and the standard failure schema.
 */
export const createResultSchema = <T extends Schema.Schema<any>>(dataSchema: T) =>
  Schema.Union([createSuccessSchema(dataSchema), FailureSchema])

/**
 * Represents the union of success and failure states for a schema validation result.
 */
export type ResultSchemaType<T extends Schema.Schema<any>> =
  | {
      readonly success: true
      readonly data: Schema.Schema.Type<T>
    }
  | {
      readonly success: false
      readonly error: PublicError
    }

/**
 * Executes an operation returning a Result, validates the success value against the provided schema, and maps errors into a public-facing error format.
 *
 * @param dataSchema The schema used to validate the successful result.
 *
 * @param effectResult A function that performs the operation and returns a Result.
 *
 * @param mapError A function to transform internal errors into public errors.
 *
 * @returns A promise resolving to a ResultSchemaType containing either the successful data or the mapped public error.
 */
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

/**
 * Executes a streaming API operation and maps errors to public-facing responses.
 *
 * @param effectResult An asynchronous operation returning a Result.
 *
 * @param mapError A mapper function to convert internal errors into public error structures.
 *
 * @returns The success response or a JSON error response.
 */
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
