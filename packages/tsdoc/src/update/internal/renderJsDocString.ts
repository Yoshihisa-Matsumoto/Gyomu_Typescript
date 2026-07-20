import type { JsDocLine } from '../jsdoc/JsDocLine.js'

export const renderJsDocString = (
  lines: Array<JsDocLine>,
  isAdded: boolean,
  indent: string,
): string | undefined => {
  if (lines.length == 0) return undefined
  const jsDocStart = indent + '/**'
  const jsDocEnd = indent + (isAdded ? ' */\n' : ' */')
  const stringLines: Array<string> = [
    jsDocStart,
    ...lines.map((l) => computeLine(l, indent)),
    jsDocEnd,
  ]
  return stringLines.join('\n')
}

export const computeLine = (line: JsDocLine, indent: string): string => {
  switch (line.type) {
    case 'blank':
      return indent + ' *'
    case 'text':
    case 'tag':
      return line.text
        .split('\n')
        .map((text) => indent + ` *` + ` ${text}`.trimEnd())
        .join('\n')
  }
}
