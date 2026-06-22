export interface UpdateOptions {
  debugInfo:
    | {
        JsDocUpdateContext?: boolean
        JsDocUpdatePlan?: boolean
        MergePlan?: boolean
        UpdatedSymbolJsDoc?: boolean
        RenderedSymbolJsDoc?: boolean
        FileUpdatePlan?: boolean

        DumpToFile?: boolean
      }
    | undefined
  action:
    | {
        NoLLMRequest?: boolean
        NoUpdateTSDoc?: boolean
        WriteToTempFolder?: boolean
      }
    | undefined
}
