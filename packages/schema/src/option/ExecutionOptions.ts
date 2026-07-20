/**
 * Defines configuration options for execution, including metadata paths, debugging settings, and action-specific flags.
 */
export interface ExecutionOptions {
  /**
   * The root path for execution metadata.
   */
  metadataRoot?: string

  /**
   * Settings related to debug information capture.
   */
  debugInfo?: {
    DumpToFile?: boolean
  }

  /**
   * Settings for controlling the execution behavior.
   */
  action?: {
    noLLMRequest?: boolean
    WriteToTempFolder?: boolean
  }
}
