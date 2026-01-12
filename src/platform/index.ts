import { linux } from './linux';
import { windows } from './windows';

export const platform = process.platform === 'win32' ? windows : linux;
