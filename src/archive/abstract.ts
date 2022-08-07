import path from 'path';
import fs from 'fs';
import { ArchiveError } from '../errors';
import { PromiseResult } from '../result';

export abstract class AbstractBaseArchive {
  readonly archiveFileName: string;
  constructor(tarFilename: string) {
    this.archiveFileName = tarFilename;
  }
  protected __massageEntryPath(fileName: string) {
    return fileName.replace(/\\/g, '/');
  }

  protected __createDirectoryFromFileNameIfNotExist(
    destinationFilename: string
  ) {
    let directoryName = path.dirname(destinationFilename);

    if (destinationFilename.endsWith(path.sep))
      directoryName = destinationFilename;
    return this.__createDirectoryIfNotExist(directoryName);
  }
  protected __createDirectoryIfNotExist(destinationPath: string) {
    let directoryName = destinationPath;

    if (!fs.existsSync(directoryName)) {
      //console.log(directoryName + ' to be created');
      fs.mkdirSync(directoryName);
    }
  }
}
