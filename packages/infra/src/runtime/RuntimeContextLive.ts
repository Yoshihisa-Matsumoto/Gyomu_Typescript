import { pid } from 'node:process'
import { hostname, networkInterfaces } from 'node:os'
import { Layer } from 'effect'
import { RuntimeContext } from '@gyomu/schema/shared'

export const RuntimeContextLive = Layer.sync(RuntimeContext, () => {
  const nets = networkInterfaces()
  const net = nets['en0']?.find((v) => v.family == 'IPv4')

  return {
    machineName: hostname(),
    address: net?.address ?? '',
    pid,
  }
})
