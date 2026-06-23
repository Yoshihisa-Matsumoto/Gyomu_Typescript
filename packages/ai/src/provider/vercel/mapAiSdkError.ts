import { APICallError, RetryError } from 'ai'
import { withOptional } from '@gyomu/schema'
import type { AIErrorContext, AIOperation } from '@gyomu/schema'

export const mapAiSdkError = (
  error: unknown,
  params: { model: string; operation: AIOperation },
): AIErrorContext => {
  const actualError =
    error instanceof Error && 'cause' in error && error.cause ? error.cause : error
  if (APICallError.isInstance(actualError)) {
    switch (actualError.statusCode) {
      case 429: {
        const delayMs = retrieveRetryMs(actualError)
        const diagnoseResult = diagnoseApiCallError(actualError)
        if (!diagnoseResult.isTemporally) {
          return {
            operation: params.operation,
            model: params.model,
            cause: actualError,
            message: actualError.message,
            phase: 'rate-limit',
            retryable: false,
            retryStrategy: { _tag: 'none' },
            statusCode: actualError.statusCode,
            details: diagnoseResult.error,
          }
        }
        if (delayMs) {
          return {
            operation: params.operation,
            model: params.model,
            cause: actualError,
            message: actualError.message,
            phase: 'rate-limit',
            retryable: actualError.isRetryable,
            retryStrategy: { _tag: 'retry-after', delayMs },
            statusCode: actualError.statusCode,
          }
        } else {
          return {
            operation: params.operation,
            model: params.model,
            cause: error,
            message: actualError.message,
            phase: 'rate-limit',
            retryable: false,
            retryStrategy: { _tag: 'none' },
            statusCode: actualError.statusCode,
          }
        }
      }
      case 503:
        return {
          operation: params.operation,
          model: params.model,
          cause: error,
          message: actualError.message,
          phase: 'response',
          retryable: actualError.isRetryable,
          retryStrategy: { _tag: 'exponential' },
          statusCode: actualError.statusCode,
        }
      case 400:
        return {
          operation: params.operation,
          model: params.model,
          cause: error,
          message: actualError.message,
          phase: 'request',
          retryable: false,
          retryStrategy: { _tag: 'none' },
          statusCode: actualError.statusCode,
        }
      default:
        return {
          operation: params.operation,
          model: params.model,
          cause: error,
          message: actualError.message,
          phase: 'request',
          retryable: false,
          retryStrategy: { _tag: 'none' },
          ...withOptional({ statusCode: actualError.statusCode }),
        }
    }
  }
  if (RetryError.isInstance(error)) {
    const delayMs = retrieveRetryMsFromRetryError(error)
    if (delayMs) {
      return {
        operation: params.operation,
        model: params.model,
        cause: error,
        message: error.message,
        phase: 'rate-limit',
        retryable: true,
        retryStrategy: { _tag: 'retry-after', delayMs },
        statusCode: 409,
      }
    } else {
      return {
        operation: params.operation,
        model: params.model,
        cause: error,
        message: error.message,
        phase: 'rate-limit',
        retryable: false,
        retryStrategy: { _tag: 'none' },
        statusCode: 409,
      }
    }
  }

  return {
    cause: error,
    message: 'Unknown Error',
    model: params.model,
    operation: params.operation,
    phase: 'request',
    retryStrategy: { _tag: 'none' },
    retryable: false,
  }
}
const diagnoseApiCallError = (
  error: APICallError,
): { isTemporally: false; error: string | undefined } | { isTemporally: true } => {
  if (error.responseBody) {
    try {
      const responseObj = JSON.parse(error.responseBody)

      const violations = responseObj.details?.find(
        (d: any) => d['@type'] == 'type.googleapis.com/google.rpc.QuotaFailure',
      )?.violations

      if (Array.isArray(violations)) {
        const targetViolation = violations.find(
          (v) => v.quotaId && v.quotaid == 'GenerateRequestsPerDayPerProjectPerModel-FreeTier',
        )
        if (targetViolation) {
          return { isTemporally: false, error: JSON.stringify(targetViolation) }
        }
      }
    } catch {
      // ignore
    }
  }
  return { isTemporally: true }
}
const retrieveRetryMs = (error: APICallError) => {
  if (error.responseBody) {
    try {
      const responseObj = JSON.parse(error.responseBody)

      const retryDelay = responseObj.details?.find((d: any) => d.retryDelay)?.retryDelay

      if (typeof retryDelay === 'string' && retryDelay.endsWith('s')) {
        return Math.ceil(Number(retryDelay.slice(0, -1)) * 1000)
      }
    } catch {
      // ignore
    }
  }
  const match = error.message.match(/Please retry in ([\d.]+)s/i)

  if (match) {
    const seconds = Number(match[1])
    return Math.ceil(seconds * 1000)
  }
}

const retrieveRetryMsFromRetryError = (error: RetryError) => {
  const match = error.message.match(/Please retry in ([\d.]+)s/i)

  if (match) {
    const seconds = Number(match[1])
    return Math.ceil(seconds * 1000)
  }
}
