import { platform } from '../platform';

export abstract class AbstractBaseArchive {
  readonly archiveFileName: string | undefined;
  readonly archiveContent: Buffer | undefined;
  constructor(filename: string | undefined, content?: Buffer) {
    if (!filename && !content) throw Error('Filename or Content must be valid');
    if (filename && content)
      throw Error('Both Filename and Content MUST NOT be valid');
    this.archiveFileName = filename;
    this.archiveContent = content;
  }
  protected __massageEntryPath(fileName: string) {
    return fileName.replace(/\\/g, '/');
  }

  protected __createDirectoryFromFileNameIfNotExist(
    destinationFilename: string,
  ) {
    let directoryName = platform.dirname(destinationFilename);

    if (destinationFilename.endsWith(platform.sep))
      directoryName = destinationFilename;
    return this.__createDirectoryIfNotExist(directoryName);
  }
  protected __createDirectoryIfNotExist(destinationPath: string) {
    const directoryName = destinationPath;
    platform.ensureDirSync(directoryName);
    // if (!platform.existsSync(directoryName)) {
    //   //console.log(directoryName + ' to be created');
    //   platform.mkdirSync(directoryName);
    // }
  }
}
