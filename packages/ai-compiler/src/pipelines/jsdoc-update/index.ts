export { DeepJsDocContext, LightJsDocContext } from './context/JsDocUpdateContext.js'
export {
  JsDocUpdateContext,
  ProtectedSection,
  ExistingJsDoc,
  ContextEntry,
  JsDocContextBase,
} from './context/JsDocUpdateContext.js'
export * from './mode/index.js'
export { executeJsDocUpdatePlan } from './executor/executeJsDocUpdatePlan.js'
export {
  JsDocUpdatePlan,
  MergeAction,
  JsDocTarget,
  ParamActionValue,
  ParamMergeAction,
} from './schema/JsDocUpdatePlan.js'
