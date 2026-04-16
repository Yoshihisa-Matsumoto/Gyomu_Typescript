export type CsvValue = string | number | boolean | null | undefined;
export type CsvRow = Record<string, CsvValue>;
export type CsvColumn<A> = {
  key: keyof A & string;
  header: string;
};

export type CsvReadOption<R> = {
  fields?: readonly CsvColumn<R>[];
  bom?: boolean;
  encoding?: string;
  filterRaw?: (row: Record<string, string>) => boolean;
  filter?: (row: R) => boolean;
  onInvalidRow?: (raw: unknown) => void;
};

export type CsvWriteOption<R> = {
  fields?: readonly CsvColumn<R>[];
  quoted?: boolean;
  bom?: boolean;
  recordDelimiter?: 'windows' | 'unix';
};
