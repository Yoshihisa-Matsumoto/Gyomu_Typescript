import os from 'os';

import { windows } from './windows';
import { linux } from './linux';

export const platform = os.platform() === 'win32' ? windows : linux;

export * from './type';
