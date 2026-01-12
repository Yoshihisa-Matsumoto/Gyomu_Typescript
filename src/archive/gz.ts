import { FileTransportInfo } from '../fileModel';

import { ArchiveError } from '../errors';
import { fail, Result, success, PromiseResult, Failure } from '../result';

import { AbstractBaseArchive } from './abstract';
import zlib from 'zlib';
import { platform } from '../platform';

/**
 * @remarks
 * This class (extract side) doesn't support stream based retrieval yet
 */
export class GzipArchive extends AbstractBaseArchive {
  static async create(
    gzipFilename: string,
    sourceFilename: string
  ): PromiseResult<boolean, ArchiveError> {
    return new Promise((resolve, reject) => {
      platform
        .createReadStream(sourceFilename)
        .pipe(zlib.createGzip())
        .pipe(platform.createWriteStream(gzipFilename))
        .on('error', (err) => {
          resolve(
            new Failure(new ArchiveError('Error on gzip compression', err))
          );
        })
        .on('finish', () => {
          resolve(success(true));
        });
    });
  }
  static async extract(
    gzipFilename: string,
    destinationFilename: string
  ): PromiseResult<boolean, ArchiveError> {
    return new Promise((resolve, reject) => {
      platform
        .createReadStream(gzipFilename)
        .pipe(zlib.createGunzip())
        .pipe(platform.createWriteStream(destinationFilename))
        .on('error', (err) => {
          resolve(
            new Failure(new ArchiveError('Error on gzip uncompression', err))
          );
        })
        .on('finish', () => {
          resolve(success(true));
        });
    });
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
