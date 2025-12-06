import { GenericElement } from './element';
import { TableRow } from './tableRow';

export type TableOption = {
  headerExist: boolean;
};
export class Table extends GenericElement<HTMLTableElement> {
  #headerExist: boolean;
  constructor(
    node: HTMLTableElement,
    { headerExist }: TableOption = { headerExist: true }
  ) {
    super(node);
    this.#headerExist = headerExist;
    this.#build();
  }

  __headers = new Array<TableRow>();
  __records = new Array<TableRow>();

  get rows() {
    return this.__records;
  }

  #build() {
    this.__headers = new Array<TableRow>();
    this.__records = new Array<TableRow>();
    let previousRow: TableRow | undefined = undefined;
    const tHeads = this.getGenericElementsByTagName('thead');
    if (!!tHeads && tHeads.length > 0) {
      const tHead = tHeads[0];

      tHead.getGenericElementsByTagName('tr').forEach((thRow) => {
        const row = new TableRow(thRow.node, previousRow);
        this.__headers.push(row);
        previousRow = row;
      });
    }
    previousRow = undefined;

    let isHeaderFromRecord = false;
    const rows: Array<GenericElement<HTMLTableRowElement>> =
      this.getGenericElementsByTagName('tr');
    // console.log(this.node);
    // let tableRows = Array.from(this.node.rows);
    // if (tableRows.length > 0) {
    //   rows.push(...tableRows);
    // } else {
    //   Array.from(this.node.tBodies).forEach((tblSection) => {
    //     rows.push(...Array.from(tblSection.rows));
    //   });
    // }

    if (this.__headers.length === 0 && this.#headerExist) {
      isHeaderFromRecord = true;
      if (rows.length > 0) {
        this.__headers.push(new TableRow(rows[0].node, undefined));
      }
    }
    let isFirstRecord = true;
    rows.forEach((row) => {
      if (isFirstRecord && isHeaderFromRecord) {
        isFirstRecord = false;
        return;
      }
      const tRow = new TableRow(row.node, previousRow);
      this.__records.push(tRow);
      previousRow = tRow;
    });
  }

  toDictionaryArray() {
    const columnIndex = new Map<number, string>();
    let index: number = 0;
    let isHeaderExistInRecord = false;
    if (this.__headers.length > 0) {
      this.__headers.forEach((row) => {
        row.columns.forEach((column) => {
          columnIndex.set(index++, column.textValue);
        });
      });
    } else {
      if (this.__records.length === 0) return [{}];
      isHeaderExistInRecord = true;
      const columnCount = this.__records[0].columns.length;
      for (index = 0; index < columnCount; index++) {
        columnIndex.set(index, 'Column' + (index + 1).toString());
      }
    }
    const records: Array<{ [key: string]: string }> = new Array<{
      [key: string]: string;
    }>();
    this.__records.forEach((row) => {
      if (isHeaderExistInRecord && index == 0) {
      } else {
        const dictionary: { [key: string]: string } = {};
        let index = 0;
        columnIndex.forEach((columnName, key) => {
          dictionary[columnName] = row.columns[key].textValue;
        });
        index++;
        records.push(dictionary);
      }
    });
    return records;
  }
}
