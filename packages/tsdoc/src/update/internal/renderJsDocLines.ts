import type { JsDocParam, JsDocThrows, ParsedTag } from '@gyomu/schema/typescript'
import type { JsDocLine } from '../jsdoc/JsDocLine.js'
import type { UpdatedSymbolJsDoc } from '../jsdoc/UpdatedSymbolJsDoc.js'

export const renderJsDocLines = (updated: UpdatedSymbolJsDoc): Array<JsDocLine> => {
  const lines: Array<JsDocLine> = []
  const jsDoc = updated.jsDoc
  if (jsDoc.summary) {
    lines.push({ type: 'text', text: jsDoc.summary })
    lines.push({ type: 'blank' })
  }
  if (jsDoc.examples.length > 0) {
    for (const example of jsDoc.examples) {
      lines.push({ type: 'tag', text: `@example\n${example}` })
      lines.push({ type: 'blank' })
    }
  }
  /**
   * TODO : 場所が今は固定だが、ここを柔軟に変えられるようにする（HOW?)
   */
  const protectedRegions = [...jsDoc.protectedRegions].sort((a, b) => a.start - b.start)
  if (protectedRegions.length > 0) {
    for (const region of protectedRegions) {
      lines.push({ type: 'text', text: region.content })
      lines.push({ type: 'blank' })
    }
  }

  const params = [...jsDoc.params].sort((a, b) => a.sortOrder - b.sortOrder)
  if (params.length > 0) {
    for (const param of params) {
      lines.push({ type: 'tag', text: computeParamTag(param) })
      lines.push({ type: 'blank' })
    }
  }

  if (jsDoc.returns) {
    lines.push({ type: 'tag', text: `@returns ${jsDoc.returns.description}` })
    lines.push({ type: 'blank' })
  }

  if (jsDoc.throws.length > 0) {
    const throws = [...jsDoc.throws].sort((a, b) => a.order - b.order)
    for (const throwTag of throws) {
      lines.push({ type: 'tag', text: computeThrowTag(throwTag) })
      lines.push({ type: 'blank' })
    }
  }

  if (jsDoc.templates.length > 0) {
    for (const template of jsDoc.templates) {
      lines.push({ type: 'tag', text: `@template ${template}` })
      lines.push({ type: 'blank' })
    }
  }

  const tags = [...jsDoc.tags].sort((a, b) => a.sortOrder - b.sortOrder)
  if (tags.length > 0) {
    for (const tag of tags) {
      lines.push({ type: 'tag', text: computeOtherTag(tag) })
      lines.push({ type: 'blank' })
    }
  }

  if (lines.length > 0) {
    lines.pop()
  }

  return lines
}

const computeParamTag = (param: JsDocParam): string => {
  let tag = `@param ${param.name}`
  if (param.description) tag += ` ${param.description}`
  return tag
}

const computeOtherTag = (tag: ParsedTag): string => {
  let text = `@${tag.tagName}`
  if (tag.key) text += ` ${tag.key}`
  if (tag.text) text += ` ${tag.text}`
  return text
}

const computeThrowTag = (throwTag: JsDocThrows): string => {
  let text = `@throws`
  if (throwTag.description) text += ` ${throwTag.description}`
  return text
}
