import { FileTransportInfo } from '../fileModel';

import fs from 'fs';
import path, { resolve } from 'path';
import { ArchiveError } from '../errors';
import { fail, Result, success, PromiseResult, Failure } from '../result';

import { AbstractBaseArchive } from './abstract';
import zlib from 'zlib';

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
      fs.createReadStream(sourceFilename)
        .pipe(zlib.createGzip())
        .pipe(fs.createWriteStream(gzipFilename))
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
      fs.createReadStream(gzipFilename)
        .pipe(zlib.createGunzip())
        .pipe(fs.createWriteStream(destinationFilename))
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
    return fs.createReadStream(gzipFilename).pipe(zlib.createGunzip());
  }
}
