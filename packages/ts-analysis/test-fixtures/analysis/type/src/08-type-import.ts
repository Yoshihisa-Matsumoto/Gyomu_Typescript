/* eslint-disable @typescript-eslint/consistent-type-imports */
export type ImportedType = import('./types.js').User

export type ImportedGeneric = import('./types.js').Box<string>

export type ImportedNamespace = import('./types.js').Namespace.Member
