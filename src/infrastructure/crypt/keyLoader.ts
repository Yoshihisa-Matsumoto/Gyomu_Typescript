import { platform } from '../fs/index.js';

export const loadKeyFromFile = (filename: string) => {
  return platform.readFileSync(filename);
};
