export interface UpdateOptions {
  debugInfo:
    | {
        JsDocUpdateContext?: boolean
        JsDocUpdatePlan?: boolean
        MergePlan?: boolean
        UpdatedSymbolJsDoc?: boolean
        RenderedSymbolJsDoc?: boolean
        FileUpdatePlan?: boolean
      }
    | undefined
}
