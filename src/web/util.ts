import { GenericElement } from './element';
import { Table, TableOption } from './table';
import xpath from 'xpath';
import { Attribute } from './attribute';
import { WebParseError } from '../errors';

export type ElementGenerationOption = TableOption;

interface ElementOptionTagNameMap {
  table: TableOption;
}
interface ElementTagNameMap {
  table: Table;
}

export function convertHTMLElementByTagName<
  K extends keyof HTMLElementTagNameMap &
    keyof ElementOptionTagNameMap &
    keyof ElementTagNameMap
>(
  qualifiedName: K,
  element: HTMLElementTagNameMap[K],
  option: ElementOptionTagNameMap[K]
): ElementTagNameMap[K] {
  switch (qualifiedName) {
    case 'table':
      const tableOption = option as ElementOptionTagNameMap[K];
      return new Table(element, tableOption);
  }
  throw new Error('Unknown Error');
}

export function convertGenericElementByTagName<
  K extends keyof HTMLElementTagNameMap &
    keyof ElementOptionTagNameMap &
    keyof ElementTagNameMap
>(
  qualifiedName: K,
  genericElement: GenericElement<HTMLElementTagNameMap[K]>,
  option: ElementOptionTagNameMap[K]
): ElementTagNameMap[K] {
  switch (qualifiedName) {
    case 'table':
      const tableOption = option as ElementOptionTagNameMap[K];
      return new Table(genericElement.node, tableOption);
  }
  throw new Error('Unknown Error');
}

export function parseXPathResultValue(
  searchValue: xpath.SelectedValue | undefined
) {
  if (!searchValue) return undefined;
  return parseXPathResultValidValue(searchValue);
}
export function parseXPathResultValidValue(searchValue: xpath.SelectedValue) {
  switch (typeof searchValue) {
    case 'string':
      return searchValue as string;
    case 'number':
      return searchValue as number;
    case 'boolean':
      return searchValue as boolean;
    default:
      if (searchValue instanceof Attr) {
        return new Attribute(searchValue);
      } else {
        if (searchValue instanceof HTMLElement) {
          return new GenericElement<HTMLElement>(searchValue);
        } else {
          throw new WebParseError(
            `Unsupported Value: ${JSON.stringify(searchValue)}`
          );
        }
      }
  }
}
