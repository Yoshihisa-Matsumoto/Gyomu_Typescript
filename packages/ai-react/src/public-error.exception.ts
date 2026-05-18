import type { PublicError } from '@gyomu/schema'

export class PublicErrorException extends Error {
  constructor(readonly publicError: PublicError) {
    super(publicError.message)
  }
}
