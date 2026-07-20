import { APICallError, RetryError } from 'ai'
import { withOptional } from '@gyomu/schema'
import type { AIErrorContext, AIOperation } from '@gyomu/schema'

export const createAiErrorContext = (
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
        if (diagnoseResult.shouldFallback) {
          return {
            operation: params.operation,
            model: params.model,
            cause: actualError,
            message: actualError.message,
            phase: 'rate-limit',
            resolution: {
              _tag: 'fallback',
            },
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
            resolution: { _tag: 'retry', strategy: { _tag: 'retry-after', delayMs } },
            statusCode: actualError.statusCode,
          }
        } else {
          return {
            operation: params.operation,
            model: params.model,
            cause: error,
            message: actualError.message,
            phase: 'rate-limit',
            resolution: {
              _tag: 'fallback',
            },
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
          resolution: {
            _tag: 'retry',
            strategy: {
              _tag: 'exponential',
            },
          },
          statusCode: actualError.statusCode,
        }
      case 400:
        return {
          operation: params.operation,
          model: params.model,
          cause: error,
          message: actualError.message,
          phase: 'request',
          resolution: {
            _tag: 'fail',
          },
          statusCode: actualError.statusCode,
        }
      default:
        return {
          operation: params.operation,
          model: params.model,
          cause: error,
          message: actualError.message,
          phase: 'request',
          resolution: {
            _tag: 'fail',
          },
          ...withOptional({ statusCode: actualError.statusCode }),
        }
    }
  }
  if (RetryError.isInstance(actualError)) {
    const delayMs = retrieveRetryMsFromRetryError(actualError)
    if (delayMs) {
      return {
        operation: params.operation,
        model: params.model,
        cause: error,
        message: actualError.message,
        phase: 'rate-limit',
        resolution: {
          _tag: 'retry',
          strategy: {
            _tag: 'retry-after',
            delayMs,
          },
        },
        statusCode: 409,
      }
    } else {
      return {
        operation: params.operation,
        model: params.model,
        cause: actualError,
        message: actualError.message,
        phase: 'rate-limit',
        resolution: {
          _tag: 'fallback',
        },
        statusCode: 409,
      }
    }
  }

  return {
    cause: actualError,
    message: 'Unknown Error',
    model: params.model,
    operation: params.operation,
    phase: 'request',
    resolution: {
      _tag: 'fail',
    },
  }
}
const diagnoseApiCallError = (
  error: APICallError,
): { shouldFallback: true; error: string | undefined } | { shouldFallback: false } => {
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
          return { shouldFallback: true, error: JSON.stringify(targetViolation) }
        }
      }
    } catch {
      // ignore
    }
  }
  return { shouldFallback: false }
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
