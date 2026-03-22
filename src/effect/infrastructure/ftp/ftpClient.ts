import { Effect } from 'effect/Effect';
import { Stream } from 'effect/Stream';
import { FileTransportInfo } from '../../../fileModel.js';

// ftpClient.ts
export interface FtpClient {
  download: (path: string) => Stream<Uint8Array>;
  list: (path: string) => Effect<string[]>;
  getFileInfo(transportInformation: FileTransportInfo): Effect<{
    size: number;
    date: Date;
  }>;
  upload(transportInformation: FileTransportInfo): Effect<void>;
}
