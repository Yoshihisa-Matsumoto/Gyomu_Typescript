import { registerSymbolSymbolAnalysis } from './file/registerSymbolSymbolAnalysis.js'
import { registerParsedJsDoc } from './file/registerSymbolJsDoc.js'
import type {
  IndexSignatureAnalysis,
  MemberAnalysis,
  ParsedJsDoc,
  SignatureAnalysis,
  TypeAnalysis,
  TypeProperty,
} from '@gyomu/schema/schemas/typescript'
import type { SymbolId } from '@gyomu/schema/typescript'
import type { FileAnalysis } from './file/FileAnalysis.js'
import type { DocumentableTarget, FileAnalysisMetadata } from './file/FileAnalysisResult.js'

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

    registerParsedJsDoc(symbolId, metadata, symbol.parsedJsDoc)
    registerSymbolSymbolAnalysis(metadata, symbol)
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
    registerParsedJsDoc(member.id, metadata, member.parsedJsDoc)
    registerSymbolSymbolAnalysis(metadata, member)
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
  if (indexSignature.documentable) {
    registerParsedJsDoc(indexSignature.id, metadata, indexSignature.parsedJsDoc)
    registerSymbolSymbolAnalysis(metadata, indexSignature)
  }
  buildIndexFromType(indexSignature.parameterType, metadata)
  buildIndexFromType(indexSignature.type, metadata)
}
const buildIndexFromTypeProperty = (
  property: TypeProperty | undefined,
  metadata: FileAnalysisMetadata,
) => {
  if (property && property.documentable) {
    registerParsedJsDoc(property.id, metadata, property.parsedJsDoc)
    registerSymbolSymbolAnalysis(metadata, property)
  }
  if (property) {
    buildIndexFromType(property.type, metadata)
  }
}
