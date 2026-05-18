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
