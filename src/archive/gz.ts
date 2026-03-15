//import fs from 'fs';
import { runAsync, GyomuResultAsync } from '../result.js';
import { platform } from '../platform/index.js';
import { AbstractBaseArchive } from './abstract.js';
import zlib from 'zlib';
import { FileInput, toReadable } from '../buffer.js';
import { IOError } from '../errors.js';

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
            .on('error', (err: unknown) => {
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
            .on('error', (err: unknown) => {
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
