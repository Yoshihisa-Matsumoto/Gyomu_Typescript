import { PublicErrorSchema, logger } from '@gyomu/schema'
import { convertToSchemaObjectWithResult, flattenIssues } from '@gyomu/schema/entity'
import { Result } from 'effect'
import type { PublicError } from '@gyomu/schema'

export const parsePublicError = async (response: Response): Promise<PublicError> => {
  try {
    const json = await response.json()
    const result = convertToSchemaObjectWithResult(PublicErrorSchema, json, true)
    if (Result.isFailure(result)) {
      const issue = result.failure
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
