import os from 'os';

import { windows } from './windows.js';
import { linux } from './linux.js';

export const fs = os.platform() === 'win32' ? windows : linux;

export * from './types.js';
