export type ConfigResolutionMode = 'file' | 'env' | 'runtime' | 'mixed'
export type StaticResolutionMode = Exclude<ConfigResolutionMode, 'runtime'>
export type FileResolutionMode = Extract<ConfigResolutionMode, 'file' | 'mixed'>
