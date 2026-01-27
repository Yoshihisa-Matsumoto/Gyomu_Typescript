import { GenericElement } from './element';
import { Table, TableOption } from './table';

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
      //const tableOption = option as ElementOptionTagNameMap[K];
      return new Table(element, option as ElementOptionTagNameMap[K]);
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
      //const tableOption = option as ElementOptionTagNameMap[K];
      return new Table(genericElement.node, option as ElementOptionTagNameMap[K]);
  }
  throw new Error('Unknown Error');
}
