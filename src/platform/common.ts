import fs from 'fs';
import path from 'path';
import fse from 'fs-extra';
import os from 'os';

export const commonPlatform = {
  dirname: path.dirname,
  extname: path.extname,
  sep: path.sep,
  join: path.join,
  resolve: path.resolve,
  basename: path.basename,
  relative: path.relative,

  existsSync: fs.existsSync,
  mkdirSync: fs.mkdirSync,
  createReadStream: fs.createReadStream,
  createWriteStream: fs.createWriteStream,
  writeFile: fs.promises.writeFile,
  readFile: fs.promises.readFile,
  readdirSync: fs.readdirSync,
  readFileSync: fs.readFileSync,
  statSync: fs.statSync,
  openSync: fs.openSync,
  closeSync: fs.closeSync,
  writeSync: fs.writeSync,

  emptyDirSync: fse.emptydirSync,
  copySync: fse.copySync,

  tmpdir: os.tmpdir,
};

export const platformConstants = fs.constants;
