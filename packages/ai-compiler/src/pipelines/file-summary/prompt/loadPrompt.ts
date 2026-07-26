// prompt/loadPrompt.ts

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readStringFromFile } from '@gyomu/infra/fs'
import type { Effect, FileSystem } from 'effect'
import type { IOError } from '@gyomu/schema'

const currentDir = dirname(fileURLToPath(import.meta.url))

/**
 * Loads a prompt template from the file system by its name.
 *
 * @param name The name of the prompt template file.
 *
 * @returns An Effect that yields the file content as a string, requiring a FileSystem service, and potentially failing with an IOError.
 */
export const loadPrompt = (name: string): Effect.Effect<string, IOError, FileSystem.FileSystem> =>
  readStringFromFile(join(currentDir, name))
