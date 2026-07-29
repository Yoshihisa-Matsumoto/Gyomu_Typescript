import { GenericElement } from '../dom/element.js'
import { TableColumn } from './tableColumn.js'

/**
 * Represents a single row in an HTML table, managing column data and handling rowspan/colspan attributes.
 */
export class TableRow extends GenericElement<HTMLTableRowElement> {
  /**
   * The preceding row in the table, used for inheriting layout and rowspan state.
   */
  previousRow?: TableRow = undefined

  /**
   * The list of table columns associated with this row.
   */
  columns: Array<TableColumn> = new Array<TableColumn>()

  /**
   * Creates a new TableRow instance from an HTML row element.
   */
  constructor(node: HTMLTableRowElement, previousRow: TableRow | undefined = undefined) {
    super(node)
    if (previousRow) this.previousRow = previousRow
    this.__build()
  }

  /**
   * Maps column indices to remaining rowspan counts, tracking cells that span vertically.
   */
  overrideColumnRange: Map<number, number> = new Map<number, number>()

  /**
   * Populates the columns array by processing cell nodes and applying rowspan/colspan logic.
   */
  __build() {
    this.overrideColumnRange.clear()
    this.columns = new Array<TableColumn>()
    const copyingIndexList = new Array<number>()
    if (this.previousRow) {
      for (const key of this.previousRow.overrideColumnRange.keys()) {
        copyingIndexList.push(key)
        const range = (this.previousRow.overrideColumnRange.get(key) as number) - 1
        if (range > 0) this.overrideColumnRange.set(key, range)
      }
    }
    let index = 0
    const columnList = this.getGenericElementsByTagName('td')
    // const isHeader = columnList.length > 0 ;
    if (columnList.length > 0) {
      for (const columnNode of columnList) {
        index = this.#buildHeader(copyingIndexList, columnNode, index)
      }
      while (copyingIndexList.includes(index)) {
        if (this.previousRow)
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          this.columns.push(this.previousRow.columns[index]!.fakeCopy())
        index++
      }
    }
  }

  /**
   * Processes a table cell and updates the column list, accounting for colspan and rowspan attributes.
   *
   * @returns The updated column index after processing.
   */
  #buildHeader(
    copyingIndexList: Array<number>,
    column: GenericElement<HTMLTableCellElement>,
    currentIndex: number,
  ): number {
    while (copyingIndexList.includes(currentIndex)) {
      if (this.previousRow) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        this.columns.push(this.previousRow.columns[currentIndex]!.fakeCopy())
      }
      currentIndex++
    }

    const columnElement = new TableColumn(column.node, true)
    const columnAttributes = columnElement.attributes
    const rowSpans = columnAttributes.filter((a) => a.name.toLowerCase() === 'rowspan')
    if (rowSpans.length > 0) {
      this.overrideColumnRange.set(currentIndex, Number(rowSpans[0]?.value) - 1)
    }
    const colSpans = columnAttributes.filter((a) => a.name.toLowerCase() === 'colspan')
    let columnCount = 1
    if (colSpans.length > 0) {
      columnCount = Number(colSpans[0]?.value)
    }
    const columnOriginalCount = columnCount
    while (columnCount > 0) {
      if (columnOriginalCount === columnCount) {
        this.columns.push(columnElement)
      } else {
        this.columns.push(columnElement.fakeCopy())
      }
      columnCount--
      currentIndex++
    }
    return currentIndex
  }
}
