export type CsvReadOption = {
  fields?: string[];
  bom?: boolean;
  encoding?: string;
  filterFn?: (data: Record<string, string>) => boolean;
};

export type CsvWriteOption<R> = {
  fields?: Record<string, string>;
  quoted?: boolean;
  bom?: boolean;
  mapRow?: (row: R) => Record<string, string>;
};
