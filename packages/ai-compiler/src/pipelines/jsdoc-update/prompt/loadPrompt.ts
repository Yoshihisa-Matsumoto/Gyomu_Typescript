// prompt/loadPrompt.ts

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readStringFromFile } from '@gyomu/infra/fs'
import type { Effect, FileSystem } from 'effect'
import type { IOError } from '@gyomu/schema'

const currentDir = dirname(fileURLToPath(import.meta.url))

/**
 * Loads the content of a prompt file from the local file system.
 *
 * @param name The name of the prompt file to load.
 *
 * @returns An Effect that yields the file content as a string, or an IOError if the file could not be read. Requires FileSystem access.
 */
export const loadPrompt = (name: string): Effect.Effect<string, IOError, FileSystem.FileSystem> =>
  readStringFromFile(join(currentDir, name))
