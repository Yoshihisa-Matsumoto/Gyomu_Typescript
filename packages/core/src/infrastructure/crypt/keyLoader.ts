import { fs } from '../fs/index.js';

export const loadKeyFromFile = (filename: string) => {
  return fs.readFileSync(filename);
};
