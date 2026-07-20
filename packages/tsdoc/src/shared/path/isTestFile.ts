export const isTestFile = (path: string): boolean =>
  /\.test\.[jt]sx?$/.test(path) || /\.spec\.[jt]sx?$/.test(path) || path.includes('__tests__')
