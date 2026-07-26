import { logger } from '@gyomu/schema'
import { parsePublicError } from './parse-public-error.js'
import { PublicErrorException } from './public-error.exception.js'

/**
 * Creates a fetch-compatible wrapper that automatically handles non-OK responses by throwing a PublicErrorException and logs unexpected failures.
 *
 * @returns A fetch-compatible function.
 */
export const createGyomuFetch =
  (): typeof fetch => async (input: string | URL | Request, init?: RequestInit) => {
    try {
      const response = await fetch(input, init)
      if (!response.ok) {
        const publicError = await parsePublicError(response)

        throw new PublicErrorException(publicError)
      }
      return response
    } catch (error) {
      if (error instanceof PublicErrorException) {
        throw error
      }
      logger.error(
        {
          error:
            error instanceof Error
              ? {
                  message: error.message,
                  stack: error.stack,
                }
              : error,
        },
        'Fetch Unexpected Error',
      )
      throw new PublicErrorException({
        code: 'unexpected_failure',
        message: '予期しないエラーが発生しました',
        retryable: false,
      })
    }
  }
