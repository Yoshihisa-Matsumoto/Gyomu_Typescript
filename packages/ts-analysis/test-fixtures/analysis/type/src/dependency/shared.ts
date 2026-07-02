/* eslint-disable @typescript-eslint/no-empty-object-type */
export class ImportedBaseClass {}

export interface ImportedInterface {}

export class ImportedClass {}

export interface ImportedBase {}
export interface ImportedType {}

export interface ImportedResult<T> {}

export function importedFactory(): ImportedClass {
  return new ImportedClass()
}

export function importedFunction() {}
export type ImportedCallback<T> = (value: T) => T
