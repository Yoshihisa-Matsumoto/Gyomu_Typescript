import { GenericElement } from './element';
import { TableColumn } from './tableColumn';

export class TableRow extends GenericElement<HTMLTableRowElement> {
  previousRow?: TableRow = undefined;
  columns: Array<TableColumn> = new Array<TableColumn>();
  constructor(
    node: HTMLTableRowElement,
    previousRow: TableRow | undefined = undefined
  ) {
    super(node);
    this.previousRow = previousRow;
    this.__build();
  }

  overrideColumnRange: Map<number, number> = new Map<number, number>();
  __build() {
    this.overrideColumnRange.clear();
    this.columns = new Array<TableColumn>();
    const copyingIndexList = new Array<number>();
    if (!!this.previousRow) {
      for (var key of this.previousRow.overrideColumnRange.keys()) {
        copyingIndexList.push(key);
        const range =
          (this.previousRow.overrideColumnRange.get(key) as number) - 1;
        if (range > 0) this.overrideColumnRange.set(key, range);
      }
    }
    let index = 0;
    const columnList = this.getGenericElementsByTagName('td');
    //const isHeader = columnList.length > 0 ;
    if (columnList.length > 0) {
      for (let columnNode of columnList) {
        index = this.#buildHeader(copyingIndexList, columnNode, index);
      }
      while (copyingIndexList.includes(index)) {
        if (!!this.previousRow)
          this.columns.push(this.previousRow.columns[index].fakeCopy());
        index++;
      }
    }
  }

  #buildHeader(
    copyingIndexList: Array<number>,
    column: GenericElement<HTMLTableCellElement>,
    currentIndex: number
  ): number {
    while (copyingIndexList.includes(currentIndex)) {
      if (!!this.previousRow) {
        this.columns.push(this.previousRow.columns[currentIndex].fakeCopy());
      }
      currentIndex++;
    }

    const columnElement = new TableColumn(column.node, true);
    const columnAttributes = columnElement.attributes;
    const rowSpans = columnAttributes.filter(
      (a) => a.name.toLowerCase() === 'rowspan'
    );
    if (rowSpans.length > 0) {
      this.overrideColumnRange.set(currentIndex, Number(rowSpans[0].value) - 1);
    }
    const colSpans = columnAttributes.filter(
      (a) => a.name.toLowerCase() === 'colspan'
    );
    let columnCount = 1;
    if (colSpans.length > 0) {
      columnCount = Number(colSpans[0].value);
    }
    const columnOriginalCount = columnCount;
    while (columnCount > 0) {
      if (columnOriginalCount === columnCount) {
        this.columns.push(columnElement);
      } else {
        this.columns.push(columnElement.fakeCopy());
      }
      columnCount--;
      currentIndex++;
    }
    return currentIndex;
  }
}
