export const FilterType = {
  FileName: 'Name',
  CreateTime: 'Create Time',
  LastAccessTime: 'Last Access Time',
  LastModifiedTime: 'Last Modified Time',
} as const;

export type FilterType = (typeof FilterType)[keyof typeof FilterType];

export const FileCompareType = {
  Equal: 'Equal',
  Larger: 'Larger',
  Less: 'Less',
  LargerOrEqual: 'LargerOrEqual',
  LessOrEqual: 'LessOrEqual',
} as const;

export type FileCompareType =
  (typeof FileCompareType)[keyof typeof FileCompareType];

export const FileArchiveType = {
  Zip: 'zip',
  Tgz: 'tgz',
  BZip2: 'bz2',
  GZip: 'gz',
  Tar: 'tar',
  GuessFromFileName: 'unknown',
} as const;
export type FileArchiveType =
  (typeof FileArchiveType)[keyof typeof FileArchiveType];
