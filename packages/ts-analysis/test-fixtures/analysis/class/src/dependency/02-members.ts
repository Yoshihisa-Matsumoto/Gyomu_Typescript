/* eslint-disable @typescript-eslint/no-empty-object-type */
import { ImportedClass, importedFactory, importedFunction } from './shared.js'
import type { ImportedType } from './shared.js'

class LocalClass {}
type LocalType = {}

function localFactory() {
  return new LocalClass()
}

function localFunction() {}

export class MemberDependencyClass {
  localProperty: LocalType

  importedProperty: ImportedType

  localInitialized = localFactory()

  importedInitialized = importedFactory()

  constructor(local: LocalType, imported: ImportedType) {
    localFunction()
    importedFunction()

    new LocalClass()
    new ImportedClass()

    this.localProperty = local
    this.importedProperty = imported
  }

  method(local: LocalType, imported: ImportedType): ImportedType {
    localFunction()
    importedFunction()

    new LocalClass()
    new ImportedClass()

    return {}
  }
}
