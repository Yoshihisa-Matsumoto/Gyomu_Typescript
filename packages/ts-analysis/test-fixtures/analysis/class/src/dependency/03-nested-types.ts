/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { ImportedResult, ImportedType } from './shared.js'

class LocalClass {}

type LocalType = {}

export class NestedTypes {
  declare a: Promise<ImportedType>

  declare b: Map<string, Array<ImportedType>>

  declare c: Promise<LocalType>

  declare d: Array<Map<string, LocalType>>

  declare e: ImportedType | LocalType

  declare f: ImportedResult<LocalType>

  declare g: Record<string, ImportedType>

  declare h: LocalClass | ImportedType
}
