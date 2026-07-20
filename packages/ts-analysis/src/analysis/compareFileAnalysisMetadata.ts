import type { FileAnalysisMetadata, SymbolId } from '@gyomu/schema/typescript'

export const compareFileAnalysisMetadata = (
  source: FileAnalysisMetadata,
  destination: FileAnalysisMetadata,
) => {
  // Symbol
  if (
    !compareSymbolIdArray(
      'Symbol',
      source.symbols.keys().toArray(),
      destination.symbols.keys().toArray(),
    )
  ) {
    console.log('source')
    console.dir(source.symbols.keys().toArray())
    console.log('destination')
    console.dir(destination.symbols.keys().toArray())
    throw new Error('Symbol Diff')
  }

  // JsDoc
  if (
    !compareSymbolIdArray(
      'JsDoc',
      source.parsedJsDocs.keys().toArray(),
      destination.parsedJsDocs.keys().toArray(),
    )
  ) {
    console.log('source')
    console.dir(source.symbols.keys().toArray())
    console.log('destination')
    console.dir(destination.symbols.keys().toArray())
    throw new Error('JsDoc Diff')
  }
}

const compareSymbolIdArray = (
  category: string,
  source: Array<SymbolId>,
  destination: Array<SymbolId>,
) => {
  let isSame = true
  source.forEach((a) => {
    if (!destination.includes(a)) {
      isSame = false
      console.log(`${category}: ${a} Not exist in destination`)
    }
  })
  destination.forEach((b) => {
    if (!source.includes(b)) {
      isSame = false
      console.log(`${category}: ${b} Not exist in source`)
    }
  })

  return isSame
}
