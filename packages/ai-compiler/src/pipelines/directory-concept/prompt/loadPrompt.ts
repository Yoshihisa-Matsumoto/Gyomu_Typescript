// prompt/loadPrompt.ts

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readStringFromFile } from '@gyomu/infra/fs'
import type { Effect, FileSystem } from 'effect'
import type { IOError } from '@gyomu/schema'

const currentDir = dirname(fileURLToPath(import.meta.url))

/**
 * Loads a prompt template string from the current directory.
 *
 * @param name The name of the prompt file.
 *
 * @returns An Effect representing the file content string, requiring a FileSystem service, or failing with an IOError.
 */
export const loadPrompt = (name: string): Effect.Effect<string, IOError, FileSystem.FileSystem> =>
  readStringFromFile(join(currentDir, name))
