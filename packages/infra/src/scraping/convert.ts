import { Table } from './table/table.js'
import type { GenericElement } from './dom/element.js'
import type { TableOption } from './table/table.js'

export type ElementGenerationOption = TableOption

interface ElementOptionTagNameMap {
  table: TableOption
}
interface ElementTagNameMap {
  table: Table
}

export function convertTableElement(
  element: HTMLTableElement,
  option: ElementOptionTagNameMap['table'],
): ElementTagNameMap['table'] {
  return new Table(element, option)
}

export function convertGenericElementByTagName(
  qualifiedName: 'table',
  genericElement: GenericElement<HTMLTableElement>,
  option: ElementOptionTagNameMap['table'],
): ElementTagNameMap['table'] {
  return new Table(genericElement.node, option)
}
