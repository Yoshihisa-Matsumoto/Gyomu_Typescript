import type { ProtectedRegion } from '../../analysis/jsdoc/ParsedJsDoc.js'

export interface MergePlan {
  summary?: string

  params: Map<string, string>

  returns?: string

  preserveRegions: Array<ProtectedRegion>
}
