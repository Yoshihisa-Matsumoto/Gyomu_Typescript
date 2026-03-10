import { IOError } from '../../../errors';
import { Context, Effect, Scope } from '../../index';

export class FileService extends Context.Tag('FileService')<
  FileService,
  {
    open: (
      path: string,
    ) => Effect.Effect<AsyncIterable<Uint8Array>, IOError, Scope>;
  }
>() {}
