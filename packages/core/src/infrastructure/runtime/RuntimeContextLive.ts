import { Layer } from 'effect';
import { RuntimeContext } from '../../shared/runtime/runtimeContext.js';

import { pid } from 'process';
import { hostname, networkInterfaces } from 'os';

export const RuntimeContextLive = Layer.sync(RuntimeContext, () => {
  const nets = networkInterfaces();
  const net = nets['en0']?.find((v) => v.family == 'IPv4');

  return {
    machineName: hostname(),
    address: net?.address ?? '',
    pid,
  };
});
