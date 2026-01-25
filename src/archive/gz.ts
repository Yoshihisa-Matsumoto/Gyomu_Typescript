import { FileTransportInfo } from '../fileModel';

import { ArchiveError } from '../errors';
// import { fail, Result, success, PromiseResult, Failure } from '../result';
import {ResultAsync} from '../result';
import { AbstractBaseArchive } from './abstract';
import zlib from 'zlib';
import { platform } from '../platform';

/**
 * @remarks
 * This class (extract side) doesn't support stream based retrieval yet
 */
export class GzipArchive extends AbstractBaseArchive {
  static create(
    gzipFilename: string,
    sourceFilename: string
  ): ResultAsync<boolean, ArchiveError> {
    return ResultAsync.fromSafePromise(new Promise((resolve, reject) => {
      platform
        .createReadStream(sourceFilename)
        .pipe(zlib.createGzip())
        .pipe(platform.createWriteStream(gzipFilename))
        .on('error', (err) => {
          reject(
            new ArchiveError('Error on gzip compression', err)
          );
        })
        .on('finish', () => {
          resolve(true);
        });
    }));
  }
  static extract(
    gzipFilename: string,
    destinationFilename: string
  ): ResultAsync<boolean, ArchiveError> {
    return ResultAsync.fromSafePromise(new Promise((resolve, reject) => {
      platform
        .createReadStream(gzipFilename)
        .pipe(zlib.createGunzip())
        .pipe(platform.createWriteStream(destinationFilename))
        .on('error', (err) => {
          reject(
            new ArchiveError('Error on gzip uncompression', err)
          );
        })
        .on('finish', () => {
          resolve(true);
        });
    }));
  }

  static getGzipTransform() {
    return zlib.createGzip();
  }
  static getGunzipTransform() {
    return zlib.createGunzip();
  }
  static extractStream(gzipFilename: string) {
    return platform.createReadStream(gzipFilename).pipe(zlib.createGunzip());
  }
}
