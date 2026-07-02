import { ImportedClass, importedFunction } from './shared.js'
import type { ImportedType } from './shared.js'

class LocalClass {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface LocalType {}

function localFunction() {}

export function dependencyFunction<T extends ImportedType, U extends LocalClass>(
  local: LocalType,
  imported: ImportedType,
): ImportedType {
  localFunction()
  importedFunction()

  new LocalClass()
  new ImportedClass()

  return imported
}
