import { Table } from './table/table.js'
import type { GenericElement } from './dom/element.js'
import type { TableOption } from './table/table.js'

/**
 * Defines the options used for table element generation.
 */
export type ElementGenerationOption = TableOption

interface ElementOptionTagNameMap {
  table: TableOption
}
interface ElementTagNameMap {
  table: Table
}

/**
 * Converts an HTML table element into a structured Table representation using the provided options.
 *
 * @param element The DOM table element to convert.
 *
 * @param option The generation options for the table.
 *
 * @returns Returns the converted Table instance.
 */
export function convertTableElement(
  element: HTMLTableElement,
  option: ElementOptionTagNameMap['table'],
): ElementTagNameMap['table'] {
  return new Table(element, option)
}

/**
 * Converts a generic table element identified by tag name into a structured Table representation.
 *
 * @param qualifiedName The qualified tag name identifier.
 *
 * @param genericElement The generic wrapper containing the table element to convert.
 *
 * @param option The generation options for the table.
 *
 * @returns Returns the converted Table instance.
 */
export function convertGenericElementByTagName(
  qualifiedName: 'table',
  genericElement: GenericElement<HTMLTableElement>,
  option: ElementOptionTagNameMap['table'],
): ElementTagNameMap['table'] {
  return new Table(genericElement.node, option)
}
