import { Stream } from '..';

export function decodeRow<T>(schema: (row: Record<string, string>) => T) {
  return Stream.map(schema);
}
