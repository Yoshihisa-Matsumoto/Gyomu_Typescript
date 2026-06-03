import type { JsDocLine } from '../jsdoc/JsDocLine.js'

export const renderJsDocString = (lines: Array<JsDocLine>): string | undefined => {
  if (lines.length == 0) return undefined
  const jsDocStart = '/**'
  const jsDocEnd = '*/'
  const stringLines: Array<string> = [jsDocStart, ...lines.map((l) => computeLine(l)), jsDocEnd]
  return stringLines.join('\n')
}

export const computeLine = (line: JsDocLine): string => {
  switch (line.type) {
    case 'blank':
      return ' *'
    case 'text':
      return ` * ${line.text}`
    case 'tag':
      return ` * ${line.text}`
  }
}
