import { Layer } from 'effect';
import { RuntimeContext } from '../../shared/runtime/runtimeContext.js';
import { fs } from '../fs/index.js';
import { pid } from 'process';

export const RuntimeContextLive = Layer.sync(RuntimeContext, () => {
  const nets = fs.networkInterfaces();
  const net = nets['en0']?.find((v) => v.family == 'IPv4');

  return {
    machineName: fs.hostname(),
    address: net?.address ?? '',
    pid,
  };
});
