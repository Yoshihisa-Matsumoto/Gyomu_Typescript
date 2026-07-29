import { GenericElement } from '../dom/element.js'

/**
 * Defines configuration options for a table column, including whether it is an original column.
 */
export type TableColumnOption = {
  isOriginal: boolean
}

/**
 * Represents a table cell element, extending GenericElement with specific handling for original column content.
 */
export class TableColumn extends GenericElement<HTMLTableCellElement> {
  /**
   * Indicates whether this column is considered an original column.
   */
  isOriginal: boolean

  /**
   * Creates a new TableColumn instance.
   *
   * @param node The DOM table cell element.
   *
   * @param isOriginal Whether the column is an original source column. Defaults to false.
   *
   * @returns A new TableColumn instance.
   */
  constructor(node: HTMLTableCellElement, isOriginal = false) {
    super(node)
    this.isOriginal = isOriginal
  }

  /**
   * Returns the cleaned inner text value of the column if it is an original column; otherwise returns an empty string.
   *
   * @returns The cleaned text content of the cell.
   */
  get textValue(): string {
    if (this.isOriginal) {
      return this.innerText.replace('\t', '').replace('\n', '')
    }
    return ''
  }

  /**
   * Creates a copy of the current column with isOriginal set to false.
   *
   * @returns A new TableColumn instance.
   */
  fakeCopy(): TableColumn {
    const copy: TableColumn = new TableColumn(this.node, false)
    return copy
  }
}
