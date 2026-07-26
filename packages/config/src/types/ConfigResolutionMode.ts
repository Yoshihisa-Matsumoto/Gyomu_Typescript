/**
 * Defines the source strategies for resolving configuration, supporting file-based, environment-based, runtime, or mixed resolution.
 */
export type ConfigResolutionMode = 'file' | 'env' | 'runtime' | 'mixed'

/**
 * Defines resolution modes that are considered static (non-runtime), specifically 'file', 'env', or 'mixed'.
 */
export type StaticResolutionMode = Exclude<ConfigResolutionMode, 'runtime'>

/**
 * Defines resolution modes specifically involving file-based configuration, limited to 'file' or 'mixed'.
 */
export type FileResolutionMode = Extract<ConfigResolutionMode, 'file' | 'mixed'>
