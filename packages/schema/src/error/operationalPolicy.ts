export type ErrorOperationalPolicy = {
  readonly notifyParent?: boolean

  readonly logLevel: 'info' | 'warn' | 'error'

  readonly requiresInvestigation: boolean
}
