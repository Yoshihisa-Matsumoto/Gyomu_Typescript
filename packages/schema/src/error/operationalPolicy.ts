export type ErrorOperationalPolicy = {
  readonly notifySystemAdmin?: boolean

  readonly logLevel: 'info' | 'warn' | 'error'

  readonly requiresInvestigation: boolean
}
