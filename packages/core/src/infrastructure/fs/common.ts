import path from 'path';
import os from 'os';
import child_process from 'child_process';
import tmp from 'tmp';

export const commonPlatform = {
  // existsSync: (path: string): boolean => fse.existsSync(path),
  // removeSync: (path: string) => fse.removeSync(path),
  // remove: fse.remove,
  // emptyDirSync: (path: string) => fse.emptyDirSync(path),
  // ensureDirSync: (
  //   path: string,
  //   options?: number | fse.EnsureDirOptions | undefined,
  // ) => fse.ensureDirSync(path, options),
  // copySync: fse.copySync,
  // copyFileSync: fse.copyFileSync,
  // createReadStream: fse.createReadStream,
  // createWriteStream: fse.createWriteStream,
  // closeSync: fs.closeSync,
  // openSync: fs.openSync,
  // readFileSync: fse.readFileSync,
  // readFile: fs.promises.readFile,
  // writeFile: fs.promises.writeFile,
  // writeFileSync: fse.writeFileSync,
  // writeSync: fs.writeSync,
  // mkdirSync: fs.mkdirSync,
  // stat: fs.promises.stat,
  // statSync: fs.statSync,
  // readdir: fs.promises.readdir,
  // readdirSync: fs.readdirSync,
  // rmSync: fse.rmSync,
  // renameSync: fse.renameSync,
  // lstatSync: fse.lstatSync,
  // ensureFileSync: fse.ensureFileSync,
  EOL: os.EOL,
  sep: path.sep,
  basename: path.basename,
  normalize: path.normalize,
  resolve: path.resolve,
  join: path.join,
  dirname: path.dirname,
  extname: path.extname,
  relative: path.relative,
  tmpdir: os.tmpdir,
  tmpNameSync: tmp.tmpNameSync,
  networkInterfaces: os.networkInterfaces,
  hostname: os.hostname,
  parsePath: path.parse,

  getExtension(fileName: string) {
    const extName = path.extname(fileName);
    if (extName.length > 0) {
      return extName.substring(1);
    }
    return extName;
  },
  // createDirectoryFromFileNameIfNotExist(filePath: string) {
  //   const dir = path.dirname(filePath);
  //   if (!this.existsSync(dir)) {
  //     this.ensureDirSync(dir);
  //   }
  // },

  spawn: child_process.spawn,

  username: os.userInfo().username,
};
