import type { ImportedBase, ImportedClass, ImportedType } from './shared.js'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface LocalBase {}

class LocalClass {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface LocalType {}

export interface DependencyInterface<T extends ImportedType, U extends LocalClass>
  extends ImportedBase, LocalBase {
  localProperty: LocalType

  importedProperty: ImportedType

  localMethod: (value: LocalType) => ImportedType

  importedMethod: (value: ImportedType) => LocalType

  callback: <A extends ImportedType, B extends LocalClass>(
    local: LocalType,
    imported: ImportedType,
  ) => ImportedClass

  nested: Promise<ImportedType> | Map<string, Array<LocalType>>
}
