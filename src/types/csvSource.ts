import { Readable } from 'stream';

export interface CsvSource {
  name: string;
  stream: Readable;
}
