import { IOError } from '../../../errors';
import { Context, Stream } from '../../index';

export class FileService extends Context.Tag('FileService')<
  FileService,
  {
    open: (path: string) => Stream.Stream<Uint8Array, IOError>;
  }
>() {}
