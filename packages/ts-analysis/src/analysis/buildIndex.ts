import { toIdentityKey } from '@gyomu/schema/schemas/typescript'
import type {
  DocumentableMemberAnalysis,
  DocumentableTypeProperty,
  FileAnalysis,
  IndexSignatureAnalysis,
  MemberAnalysis,
  ParsedJsDoc,
  SignatureAnalysis,
  SymbolAnalysis,
  TypeAnalysis,
  TypeProperty,
} from '@gyomu/schema/schemas/typescript'
import type { DocumentableTarget, FileAnalysisMetadata, SymbolId } from '@gyomu/schema/typescript'

/**
 * Builds an index from the provided file analysis, returning a metadata object containing all symbols and parsed JSDoc comments.
 *
 * @param analysis The file analysis data structure to index.
 *
 * @returns The resulting metadata object containing maps of symbols and JSDoc data.
 */
export const buildIndex = (analysis: FileAnalysis): FileAnalysisMetadata => {
  const metadata: FileAnalysisMetadata = {
    parsedJsDocs: new Map<SymbolId, ParsedJsDoc>(),
    symbols: new Map<SymbolId, DocumentableTarget>(),
  }
  // console.log(`Number: ${analysis.symbols.length}`)
  analysis.symbols.forEach((symbol) => {
    const symbolId = symbol.id
    // console.log(symbolId)
    symbol.members.forEach((member) => {
      buildIndexFromMember(member, metadata)
    })

    buildIndexFromSignature(symbol.signature, metadata)
    buildIndexFromType(symbol.type, metadata)

    registerParsedJsDocInternal(symbolId, metadata, symbol.parsedJsDoc)
    registerSymbolSymbolAnalysisInternal(metadata, symbol)
  })
  return metadata
}

const buildIndexFromSignature = (signature: SignatureAnalysis, metadata: FileAnalysisMetadata) => {
  signature.parameters.forEach((parameter) => buildIndexFromMember(parameter, metadata))
  buildIndexFromType(signature.returnType, metadata)
  // signature.typeParameters?.forEach((tp) => buildIndexFromTypeProperty(tp, metadata))
}

const buildIndexFromMember = (member: MemberAnalysis, metadata: FileAnalysisMetadata) => {
  switch (member.kind) {
    case 'method':
      member.parameters.forEach((parameter) => buildIndexFromMember(parameter, metadata))
      buildIndexFromType(member.returnType, metadata)
      break
    case 'property':
      buildIndexFromType(member.type, metadata)

      break
  }
  if (member.documentable) {
    registerParsedJsDocInternal(member.id, metadata, member.parsedJsDoc)
    registerSymbolSymbolAnalysisInternal(metadata, member)
  }
}

const buildIndexFromType = (type: TypeAnalysis | undefined, metadata: FileAnalysisMetadata) => {
  if (!type || !type.structure) return
  if (type.generics) {
    type.generics.forEach((gp) => {
      buildIndexFromType(gp.type, metadata)
    })
  }
  const structure = type.structure

  switch (structure.kind) {
    case 'object':
      structure.properties?.forEach((member) => buildIndexFromTypeProperty(member, metadata))
      structure.indexSignatures?.forEach((member) => buildIndexFromIndexSignature(member, metadata))
      break
    case 'function':
      structure.parameters.forEach((parameter) => buildIndexFromTypeProperty(parameter, metadata))
      buildIndexFromType(structure.returnType, metadata)
      break
    case 'array':
      buildIndexFromType(structure.elementType, metadata)
      break
    case 'literal':
      break
    case 'primitive':
      break
    case 'reference':
      structure.typeParameters.forEach((tp) => buildIndexFromType(tp, metadata))
      break
    case 'union':
      structure.types.forEach((tp) => buildIndexFromType(tp, metadata))
      break
    case 'generics':
      structure.typeParameters.forEach((tp) => buildIndexFromType(tp, metadata))
      break
    case 'indexedAccess':
      buildIndexFromType(structure.indexType, metadata)
      buildIndexFromType(structure.objectType, metadata)

      break
    case 'mapped':
      buildIndexFromType(structure.constraint, metadata)
      buildIndexFromType(structure.nameType, metadata)
      buildIndexFromType(structure.valueType, metadata)
      break
    case 'typePredicate':
      buildIndexFromType(structure.type, metadata)
      break
    case 'conditional':
      buildIndexFromType(structure.checkType, metadata)
      buildIndexFromType(structure.extendsType, metadata)
      buildIndexFromType(structure.falseType, metadata)
      buildIndexFromType(structure.trueType, metadata)
      break
    case 'infer':
      buildIndexFromType(structure.constraint, metadata)
      break
    case 'typeOperator':
      buildIndexFromType(structure.target, metadata)
      break
    case 'constructor':
      buildIndexFromType(structure.returnType, metadata)
      structure.parameters.forEach((p) => buildIndexFromTypeProperty(p, metadata))
      break
    case 'parenthesized':
    case 'optional':
    case 'namedTupleMember':
    case 'rest':
      buildIndexFromType(structure.type, metadata)
      break
    case 'templateLiteral':
      structure.spans.forEach((span) => {
        if (typeof span != 'string') buildIndexFromType(span, metadata)
      })
      break
    case 'tuple':
      structure.elements.forEach((element) => buildIndexFromTypeProperty(element, metadata))
      break
    case 'import':
      structure.typeArguments.forEach((argument) => buildIndexFromType(argument, metadata))
      break
    case 'this':
      break
    default:
      assertNever(structure)
  }
}
const assertNever = (value: never): never => {
  throw new Error(`Unexpected kind: ${value}`)
}
const buildIndexFromIndexSignature = (
  indexSignature: IndexSignatureAnalysis | undefined,
  metadata: FileAnalysisMetadata,
) => {
  if (!indexSignature) return

  registerParsedJsDocInternal(indexSignature.id, metadata, indexSignature.parsedJsDoc)
  registerSymbolSymbolAnalysisInternal(metadata, indexSignature)

  buildIndexFromType(indexSignature.parameterType, metadata)
  buildIndexFromType(indexSignature.type, metadata)
}
const buildIndexFromTypeProperty = (
  property: TypeProperty | undefined,
  metadata: FileAnalysisMetadata,
) => {
  if (property && property.documentable) {
    registerParsedJsDocInternal(property.id, metadata, property.parsedJsDoc)
    registerSymbolSymbolAnalysisInternal(metadata, property)
  }
  if (property) {
    buildIndexFromType(property.type, metadata)
  }
}

/**
 * Registers a symbol analysis in the provided metadata object.
 *
 * @param metadata The metadata container to update.
 *
 * @param symbolAnalysis The specific symbol analysis entity to register.
 */
export const registerSymbolSymbolAnalysisInternal = (
  metadata: FileAnalysisMetadata,
  symbolAnalysis:
    DocumentableMemberAnalysis | SymbolAnalysis | DocumentableTypeProperty | IndexSignatureAnalysis,
) => {
  const id = toIdentityKey(symbolAnalysis.identity)

  if (!metadata.symbols.has(id)) metadata.symbols.set(id, { analysis: symbolAnalysis })
}

/**
 * Registers a single ParsedJsDoc into the metadata if one is present.
 *
 * @param symbolId The unique identifier of the symbol.
 *
 * @param metadata The metadata container to update.
 *
 * @param parsedArray The list of parsed JSDoc entries.
 */
export const registerParsedJsDocInternal = (
  symbolId: SymbolId,
  metadata: FileAnalysisMetadata,
  parsedArray: ReadonlyArray<ParsedJsDoc> | undefined,
) => {
  if (parsedArray) {
    if (parsedArray.length == 1) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const parsed: ParsedJsDoc = parsedArray[0]!

      if (!metadata.parsedJsDocs.has(symbolId)) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        metadata.parsedJsDocs.set(symbolId, parsed)
      }
    }
  }
}
