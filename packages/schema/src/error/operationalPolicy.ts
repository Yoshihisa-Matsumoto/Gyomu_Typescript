/**
 * Defines the operational policy for handling an error, specifying notification requirements, logging levels, and whether the error requires further investigation.
 */
export type ErrorOperationalPolicy = {
  /**
   * Indicates whether the system administrator should be notified of the error.
   */
  readonly notifySystemAdmin?: boolean

  /**
   * The severity level used for logging this error.
   */
  readonly logLevel: 'info' | 'warn' | 'error'

  /**
   * Indicates whether the error warrants further investigation.
   */
  readonly requiresInvestigation: boolean
}
