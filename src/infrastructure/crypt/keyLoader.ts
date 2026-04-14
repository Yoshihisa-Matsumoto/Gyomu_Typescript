import { platform } from '../../platform/index.js';

export const loadKeyFromFile = (filename: string) => {
  return platform.readFileSync(filename);
};
