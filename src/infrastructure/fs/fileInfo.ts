import { platform } from './index.js';

export class FileInfo {
  readonly fileName: string;
  readonly fullPath: string;
  readonly directoryName: string;
  readonly directoryPath: string;
  readonly size: number;
  readonly extension: string;
  readonly createTime: Date;
  readonly updateTime: Date;
  readonly lastAccessTime: Date;
  readonly isFile: boolean;

  constructor(filePath: string) {
    //console.log('FileInfo', filePath);
    const stats = platform.statSync(filePath);
    this.isFile = stats.isFile();
    if (this.isFile) {
      this.fileName = platform.basename(filePath);
      this.fullPath = platform.resolve(filePath);
      this.directoryName = platform.basename(platform.dirname(filePath));
      this.directoryPath = platform.dirname(platform.resolve(filePath));
      this.extension = platform.extname(filePath);
    } else {
      this.fileName = '';
      this.extension = '';
      this.fullPath = platform.resolve(filePath);
      this.directoryName = platform.basename(platform.dirname(filePath));
      this.directoryPath = platform.dirname(platform.resolve(filePath));
    }
    this.size = stats.size;
    this.createTime = stats.birthtime;
    this.updateTime = stats.mtime;
    this.lastAccessTime = stats.atime;
  }
}
