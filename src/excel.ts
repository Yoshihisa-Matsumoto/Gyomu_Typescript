import * as XLSX from 'xlsx';

export const exportDictionaryArrayTable = (
  excelFilename: string,
  mapArray: Array<Map<string, string>>,
  sheetName: string
) => {
  const worksheet = XLSX.utils.json_to_sheet(mapArray);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, excelFilename);
};
