export { TsDocFileContext } from './context/TsDocFileContext.js'
export {
  TsDocSymbolContext,
  ProtectedSection,
  ExistingJsDoc,
  ContextEntry,
  SchemaStructureNode,
  NonDocumentableReason,
  DocumentableInfo,
} from './context/TsDocSymbolContext.js'
export * from './mode/index.js'
export { executeJsDocUpdatePlan } from './executor/executeJsDocUpdatePlan.js'
export {
  JsDocUpdatePlan,
  JsDocUpdateEntryPlan,
  MergeAction,
  JsDocTarget,
  ParamActionValue,
  ParamMergeAction,
} from './schema/JsDocUpdatePlan.js'
