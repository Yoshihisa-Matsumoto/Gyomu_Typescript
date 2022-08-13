import { GenericElement } from './element';

export type TableColumnOption = {
  isOriginal: boolean;
};

export class TableColumn extends GenericElement<HTMLTableCellElement> {
  isOriginal: boolean;
  constructor(node: HTMLTableCellElement, isOriginal = false) {
    super(node);
    this.isOriginal = isOriginal;
  }
  get textValue(): string {
    if (this.isOriginal) {
      return this.innerText.replace('\t', '').replace('\n', '');
    }
    return '';
  }
  fakeCopy(): TableColumn {
    const copy: TableColumn = new TableColumn(this.node, false);
    return copy;
  }
}
