import type { JsDocLine } from '../jsDoc/JsDocLine.js'

/**
 * Renders an array of JSDoc lines into a formatted JSDoc comment string.
 *
 * @param lines The collection of JSDoc content lines to be rendered.
 *
 * @param isAdded Indicates if the comment should be treated as an addition, affecting trailing newline formatting.
 *
 * @param indent The indentation prefix to apply to each line.
 *
 * @returns The formatted JSDoc string, or undefined if the input lines are empty.
 */
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

/**
 * Formats an individual JSDoc line string based on its type.
 *
 * @param line The line object defining the type and content.
 *
 * @param indent The indentation prefix.
 *
 * @returns The formatted string representation of the line.
 */
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
