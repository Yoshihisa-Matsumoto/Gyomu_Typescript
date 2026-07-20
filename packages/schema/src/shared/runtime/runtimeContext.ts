import { Context } from 'effect'

/**
 * Defines the service runtime context, containing the current machine name, network address, and process identifier.
 */
export class RuntimeContext extends Context.Service<
  RuntimeContext,
  {
    readonly machineName: string
    readonly address: string
    readonly pid: number
  }
>()('RuntimeContext') {}
