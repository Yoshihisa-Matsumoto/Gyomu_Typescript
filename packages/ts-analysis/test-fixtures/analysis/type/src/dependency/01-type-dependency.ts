import type { ImportedCallback, ImportedResult, ImportedType } from './shared.js'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type LocalType = {}

class LocalClass {}

// Generic
export type DependencyType<T extends ImportedType, U extends LocalClass> =
  // Property
  {
    local: LocalType

    imported: ImportedType

    // Function type
    callback: <A extends ImportedType, B extends LocalClass>(
      local: LocalType,
      imported: ImportedType,
    ) => ImportedResult<LocalType>

    // Nested generic
    nested: Promise<ImportedType> | Map<string, Array<LocalType>>
  }

export type ImportedCallbackAlias = ImportedCallback<ImportedType>

export type LocalClassAlias = LocalClass

export type IntersectionAlias = ImportedType & LocalType
