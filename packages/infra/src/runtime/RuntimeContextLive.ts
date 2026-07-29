import { pid } from 'node:process'
import { hostname, networkInterfaces } from 'node:os'
import { Layer } from 'effect'
import { RuntimeContext } from '@gyomu/schema/shared'

/**
 * A layer providing the runtime environment context, including the machine name, IPv4 address of the 'en0' interface, and the current process ID.
 */
export const RuntimeContextLive = Layer.sync(RuntimeContext, () => {
  const nets = networkInterfaces()
  const net = nets['en0']?.find((v) => v.family == 'IPv4')

  return {
    machineName: hostname(),
    address: net?.address ?? '',
    pid,
  }
})
