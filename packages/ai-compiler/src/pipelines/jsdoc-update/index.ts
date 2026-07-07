export { TsDocFileContext } from './context/TsDocFileContext.js'
export {
  TsDocSymbolContext,
  ExistingJsDoc,
  ContextEntry,
  SchemaStructureNode,
  NonDocumentableReason,
  DocumentableInfo,
} from './context/TsDocSymbolContext.js'
export * from './mode/index.js'
export { executeJsDocUpdatePlan, TsDocRouteId } from './executor/executeJsDocUpdatePlan.js'
export {
  JsDocUpdatePlan,
  JsDocUpdateEntryPlan,
  MergeAction,
  JsDocTarget,
  ParamActionValue,
  ParamMergeAction,
  isJsDocTargetKind,
} from './schema/JsDocUpdatePlan.js'
