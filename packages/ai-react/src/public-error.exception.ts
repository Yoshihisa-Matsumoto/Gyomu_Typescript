import type { PublicError } from '@gyomu/schema'

/**
 * An exception class representing a public-facing error.
 */
export class PublicErrorException extends Error {
  /**
   * Constructs a new PublicErrorException.
   *
   * @param publicError The public error object containing the error code, message, and retryability status.
   *
   * @returns A new instance of PublicErrorException.
   */
  constructor(readonly publicError: PublicError) {
    super(publicError.message)
  }
}
