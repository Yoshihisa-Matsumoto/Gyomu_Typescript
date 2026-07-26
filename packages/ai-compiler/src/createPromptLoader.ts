import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readStringFromFile } from '@gyomu/infra/fs'

/**
 * Creates a function that loads prompt content from a file relative to the specified module URL.
 *
 * @param moduleUrl The URL of the module from which the relative path is resolved.
 *
 * @returns A function that takes a prompt filename and returns the file's content as a string.
 */
export const createPromptLoader = (moduleUrl: string) => {
  const currentDir = dirname(fileURLToPath(moduleUrl))

  return (name: string) => readStringFromFile(join(currentDir, name))
}
