/**
 * Defines the UI error handling configuration, including the display strategy, user-facing message, and retry behavior.
 */
export type UiErrorHandling = {
  readonly display: 'toast' | 'inline' | 'fullscreen'

  readonly userMessage: string

  readonly retryable: boolean

  readonly autoRetry?: boolean
}

// type UiErrorSeverity = 'info' | 'warning' | 'error'

// type UiErrorAction = {
//   readonly label: string
//   readonly action: string
// }

/**
 * Provides context for handling a UI error, including the error configuration and an optional retry callback.
 */
export type UiErrorContext = {
  error: UiErrorHandling
  retry?: () => void
}

/**
 * A callback function that handles a UI error based on the provided error context.
 */
export type UiErrorHandler = (ctx: UiErrorContext) => void

/**
 * Maps display modes to their corresponding error handler functions.
 */
export type UiErrorHandlerMap = {
  toast?: UiErrorHandler
  inline?: UiErrorHandler
  fullscreen?: UiErrorHandler
}
