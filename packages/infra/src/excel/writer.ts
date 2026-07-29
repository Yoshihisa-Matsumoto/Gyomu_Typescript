import * as XLSX from 'xlsx'

/**
 * Exports an array of maps to an Excel file.
 *
 * @param excelFilename The destination path or filename for the generated Excel file.
 *
 * @param mapArray The data to export represented as an array of maps.
 *
 * @param sheetName The name of the worksheet within the Excel workbook.
 *
 * @returns void
 */
export const exportDictionaryArrayTable = (
  excelFilename: string,
  mapArray: Array<Map<string, string>>,
  sheetName: string,
) => {
  const worksheet = XLSX.utils.json_to_sheet(mapArray)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, excelFilename)
}
