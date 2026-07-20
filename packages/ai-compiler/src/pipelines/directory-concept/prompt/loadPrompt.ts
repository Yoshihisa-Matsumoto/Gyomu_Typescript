// prompt/loadPrompt.ts

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readStringFromFile } from '@gyomu/infra/fs'
import type { Effect, FileSystem } from 'effect'
import type { IOError } from '@gyomu/schema'

const currentDir = dirname(fileURLToPath(import.meta.url))

export const loadPrompt = (name: string): Effect.Effect<string, IOError, FileSystem.FileSystem> =>
  readStringFromFile(join(currentDir, name))
