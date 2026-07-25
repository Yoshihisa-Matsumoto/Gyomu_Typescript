import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readStringFromFile } from '@gyomu/infra/fs'

export const createPromptLoader = (moduleUrl: string) => {
  const currentDir = dirname(fileURLToPath(moduleUrl))

  return (name: string) => readStringFromFile(join(currentDir, name))
}
