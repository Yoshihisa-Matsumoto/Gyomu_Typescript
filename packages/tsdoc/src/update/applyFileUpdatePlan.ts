import type { FileUpdatePlan } from './jsdoc/FileUpdatePlan.js'

export const applyFileUpdatePlan = (sourceContent: string, plan: FileUpdatePlan) => {
  // const lines = sourceContent.split('\n')
  const edits = [...plan.edits].sort((a, b) => b.startOffset - a.startOffset)
  let result = sourceContent
  for (const part of edits) {
    let newText = part.newText
    const prefix = result.slice(0, part.startOffset)
    console.log(part)
    // if (part.startOffset == part.endOffset && part.startOffset > 1 && part.indent == 0) {
    if (part.declarationOrder > 0) {
      if (!isPreviousLineEmpty(prefix)) newText = '\n' + newText
    }

    // lines.splice(part.startLine, part.endLine - part.startLine + 1, ...part.newText.split('\n'))
    result = prefix + newText + result.slice(part.endOffset)
  }
  return result
  // return lines.join('\n')
}

const isPreviousLineEmpty = (prefix: string): boolean => {
  return /(?:\r?\n){2}$/.test(prefix)
}
