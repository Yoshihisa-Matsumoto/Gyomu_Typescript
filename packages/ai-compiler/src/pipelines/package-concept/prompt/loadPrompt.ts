// prompt/loadPrompt.ts

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readStringFromFile } from '@gyomu/infra/fs'
import type { Effect, FileSystem } from 'effect'
import type { IOError } from '@gyomu/schema'

const currentDir = dirname(fileURLToPath(import.meta.url))

/**
 * Loads a prompt template string from the file system.
 *
 * @param name The name or path of the prompt file.
 *
 * @returns An Effect that yields the prompt string on success, or an IOError if the file cannot be read. Requires FileSystem service.
 */
export const loadPrompt = (name: string): Effect.Effect<string, IOError, FileSystem.FileSystem> =>
  readStringFromFile(join(currentDir, name))
