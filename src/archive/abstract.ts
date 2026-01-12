import { ArchiveError } from '../errors';
import { platform } from '../platform';
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
    let directoryName = platform.dirname(destinationFilename);

    if (destinationFilename.endsWith(platform.sep))
      directoryName = destinationFilename;
    return this.__createDirectoryIfNotExist(directoryName);
  }
  protected __createDirectoryIfNotExist(destinationPath: string) {
    let directoryName = destinationPath;

    if (!platform.existsSync(directoryName)) {
      //console.log(directoryName + ' to be created');
      platform.mkdirSync(directoryName);
    }
  }
}
