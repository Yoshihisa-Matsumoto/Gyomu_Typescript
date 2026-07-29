/**
 * Converts an array of objects into an HTML table string.
 *
 * @param records An array of objects representing table rows.
 *
 * @param includeHeader Whether to include a table header row generated from object keys.
 *
 * @returns The generated HTML table as a string.
 */
export const convertArray2HtmlTable = (
  records: Array<any>,
  includeHeader: boolean = true,
): string => {
  if (records.length === 0) return ''
  let tableHtml = '<table border=1 style="border-collapse: collapse">  '
  const keys = Object.keys(records[0])
  if (includeHeader) {
    tableHtml +=
      '<thead><tr bgcolor="yellow">' +
      keys.map((current: string) => `<th>${current}</th>`).join('') +
      '</tr></thead>'
  }
  tableHtml += '<tbody>'
  const flatRecords = records.map((record) => {
    return keys.map((current: string) => `<td>${record[current].toString()}</td>`).join('')
  })
  const recordsHtml = flatRecords.reduce(
    (prevRecord: string, currentRecord: string) => prevRecord + `<tr>${currentRecord}</tr>`,
  )

  tableHtml += recordsHtml + '</tbody></table>'
  return tableHtml
}
