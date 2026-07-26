import { PublicErrorSchema, logger } from '@gyomu/schema'
import { convertToSchemaObjectWithResult, flattenIssues } from '@gyomu/schema/entity'
import { Result } from 'effect'
import type { PublicError } from '@gyomu/schema'

/**
 * Parses a public error response from a fetch request into a standardized PublicError object.
 *
 * @param response The HTTP response object received from the server.
 *
 * @returns Returns a promise that resolves to a PublicError object representing the parsed server error or a fallback unexpected error.
 */
export const parsePublicError = async (response: Response): Promise<PublicError> => {
  try {
    const json = await response.json()
    const result = convertToSchemaObjectWithResult(PublicErrorSchema, json, true)
    if (Result.isFailure(result)) {
      const issue = result.failure.issue
      const errorDetail = flattenIssues(issue)
      logger.error(errorDetail, 'Fail to convert to schema object')
      return {
        code: 'unexpected_failure',
        message: 'エラー応答の解析に失敗しました',
        retryable: false,
      }
    }
    return result.success
  } catch {
    return {
      code: 'unexpected_failure',
      message: 'エラー応答の解析に失敗しました',
      retryable: false,
    }
  }
}
