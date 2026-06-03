import type { FileUpdatePlan } from './jsdoc/FileUpdatePlan.js'

export const applyFileUpdatePlan = (sourceContent: string, plan: FileUpdatePlan) => {
  // const lines = sourceContent.split('\n')
  const edits = [...plan.edits].sort((a, b) => b.startOffset - a.startOffset)
  let result = sourceContent
  for (const part of edits) {
    console.log(result)
    // lines.splice(part.startLine, part.endLine - part.startLine + 1, ...part.newText.split('\n'))
    result = result.slice(0, part.startOffset) + part.newText + result.slice(part.endOffset)
  }
  return result
  // return lines.join('\n')
}
