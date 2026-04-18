import { fs } from './index.js';

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
    const stats = fs.statSync(filePath);
    this.isFile = stats.isFile();
    if (this.isFile) {
      this.fileName = fs.basename(filePath);
      this.fullPath = fs.resolve(filePath);
      this.directoryName = fs.basename(fs.dirname(filePath));
      this.directoryPath = fs.dirname(fs.resolve(filePath));
      this.extension = fs.extname(filePath);
    } else {
      this.fileName = '';
      this.extension = '';
      this.fullPath = fs.resolve(filePath);
      this.directoryName = fs.basename(fs.dirname(filePath));
      this.directoryPath = fs.dirname(fs.resolve(filePath));
    }
    this.size = stats.size;
    this.createTime = stats.birthtime;
    this.updateTime = stats.mtime;
    this.lastAccessTime = stats.atime;
  }
}
