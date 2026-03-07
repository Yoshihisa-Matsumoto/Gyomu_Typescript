//import fs from 'fs';
import { runAsync, GyomuResultAsync } from '../result';
import { platform } from '../platform';
import { AbstractBaseArchive } from './abstract';
import zlib from 'zlib';
import { FileInput, toReadable } from '../buffer';
import { IOError } from '../errors';

/**
 * @remarks
 * This class (extract side) doesn't support stream based retrieval yet
 */
export class GzipArchive extends AbstractBaseArchive {
  static create(
    gzipFilename: string,
    sourceFilename: string,
  ): GyomuResultAsync<boolean> {
    return runAsync(
      () =>
        new Promise((resolve, reject) => {
          platform
            .createReadStream(sourceFilename)
            .pipe(zlib.createGzip())
            .pipe(platform.createWriteStream(gzipFilename))
            .on('error', (err) => {
              reject(new IOError('Error on gzip compression', err));
            })
            .on('finish', () => {
              resolve(true);
            });
        }),
      IOError,
      'Error on gzip compression',
    );
  }
  static extract(
    gzipFilename: string,
    destinationFilename: string,
  ): GyomuResultAsync<boolean> {
    return runAsync(
      () =>
        new Promise((resolve, reject) => {
          platform
            .createReadStream(gzipFilename)
            .pipe(zlib.createGunzip())
            .pipe(platform.createWriteStream(destinationFilename))
            .on('error', (err) => {
              reject(new IOError('Error on gzip uncompression', err));
            })
            .on('finish', () => {
              resolve(true);
            });
        }),
      IOError,
      'Error on gzip uncompression',
    );
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
  static async *fromGZip(input: FileInput, name: string = 'file.csv') {
    yield {
      name,
      stream: toReadable(input).pipe(zlib.createGunzip()),
    };
  }
}
