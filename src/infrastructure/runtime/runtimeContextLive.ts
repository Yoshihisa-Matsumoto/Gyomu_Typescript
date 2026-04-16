import { Layer } from 'effect';
import { RuntimeContext } from '../../shared/runtime/runtimeContext.js';
import { platform } from '../../platform/index.js';
import { pid } from 'process';

export const RuntimeContextLive = Layer.sync(RuntimeContext, () => {
  const nets = platform.networkInterfaces();
  const net = nets['en0']?.find((v) => v.family == 'IPv4');

  return {
    machineName: platform.hostname(),
    address: net?.address ?? '',
    pid,
  };
});
