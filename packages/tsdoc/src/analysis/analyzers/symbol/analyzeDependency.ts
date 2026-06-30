import type { DependencyRequirement, ImportAnalysis } from '@gyomu/schema/typescript'

export const analyzeDependency = (
  identity: string,
  imported: Array<ImportAnalysis>,
  memberPath: Array<string>,
): DependencyRequirement => {
  if (!hasImportedBinding(identity, imported)) {
    return {
      source: { memberPath },
      target: {
        scope: 'local-file',
        symbolName: identity,
      },
    }
  } else {
    return {
      source: { memberPath },
      target: {
        scope: 'import',
        localName: identity,
      },
    }
  }
}

const hasImportedBinding = (identity: string, imported: Array<ImportAnalysis>): boolean => {
  return !!imported.find((i) => i.localName == identity)
}
