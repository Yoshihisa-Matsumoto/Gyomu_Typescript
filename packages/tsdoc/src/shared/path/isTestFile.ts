/**
 * Determines whether a given file path corresponds to a test file based on its extension or directory name.
 *
 * @param path The file path to evaluate.
 *
 * @returns Returns true if the path is a test file, otherwise false.
 */
export const isTestFile = (path: string): boolean =>
  /\.test\.[jt]sx?$/.test(path) || /\.spec\.[jt]sx?$/.test(path) || path.includes('__tests__')
