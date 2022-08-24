import { jest } from '@jest/globals';
import { createDateFromYYYYMMDD } from '../../dateOperation';
import { FileTransportInfo } from '../../fileModel';
import { Sftp } from '../sftp';
import sftp = require('ssh2-sftp-client');
import { RemoteConnection } from '../remoteConnection';
import { JSON2SheetOpts } from 'xlsx';
import { PromiseResult, success } from '../../result';
import { NetworkError } from '../../errors';

let status = {
  access: false,
  downloadTo: false,
  downloadToDir: false,
  uploadFrom: false,
  uploadFromDir: false,
  stat: false,
  list: false,
};
const initializeStatus = () => {
  status = {
    access: false,
    downloadTo: false,
    downloadToDir: false,
    uploadFrom: false,
    uploadFromDir: false,
    stat: false,
    list: false,
  };
};
let fileStat: sftp.FileStats = {
  accessTime: 1,
  gid: 1,
  isBlockDevice: false,
  isCharacterDevice: false,
  isDirectory: false,
  isFIFO: false,
  isFile: true,
  isSocket: false,
  isSymbolicLink: false,
  mode: 1,
  modifyTime: createDateFromYYYYMMDD('19840101').getTime(),
  size: 5,
  uid: 1,
};
let fileInfoList: sftp.FileInfo[] = [
  {
    name: '1',
    size: 2,
    accessTime: 1,
    group: 1,
    modifyTime: 2,
    owner: 3,
    rights: { group: '', other: '', user: '' },
    type: '-',
  },
  {
    name: '2',
    size: 2,
    accessTime: 1,
    group: 1,
    modifyTime: 2,
    owner: 3,
    rights: { group: '', other: '', user: '' },
    type: '-',
  },
];
jest.mock('ssh2-sftp-client');
const sftpMock = sftp as jest.Mock;
sftpMock.mockImplementation(() => {
  return {
    connect: async (options: sftp.ConnectOptions) => {
      initializeStatus();
      status.access = true;
    },
    get: async (
      path: string,
      dst?: string | NodeJS.WritableStream,
      options?: sftp.TransferOptions
    ) => {
      status.downloadTo = true;
    },
    downloadDir: async (
      srcDir: string,
      destDir: string,
      filter?: string | RegExp
    ) => {
      status.downloadToDir = true;
    },
    put: async (
      input: string | Buffer | NodeJS.ReadableStream,
      remoteFilePath: string,
      options?: sftp.TransferOptions
    ) => {
      status.uploadFrom = true;
    },
    uploadDir: async (localDirPath: string, remoteDirPath?: string) => {
      status.uploadFromDir = true;
    },
    stat: async (remotePath: string) => {
      status.stat = true;
      return fileStat;
    },
    list: async (path?: string) => {
      status.list = true;
      return fileInfoList;
    },
    end: async () => {
      status.access = false;
    },
    //closed: !status.access,
  };
});
// jest.mock('ssh2-sftp-client', () => {
//   return {
//     default: jest.fn().mockImplementation(() => {
//       return {
//         connect: async (options: sftp.ConnectOptions) => {
//           initializeStatus();
//           status.access = true;
//         },
//         get: async (
//           path: string,
//           dst?: string | NodeJS.WritableStream,
//           options?: sftp.TransferOptions
//         ) => {
//           status.downloadTo = true;
//         },
//         downloadDir: async (
//           srcDir: string,
//           destDir: string,
//           filter?: string | RegExp
//         ) => {
//           status.downloadToDir = true;
//         },
//         put: async (
//           input: string | Buffer | NodeJS.ReadableStream,
//           remoteFilePath: string,
//           options?: sftp.TransferOptions
//         ) => {
//           status.uploadFrom = true;
//         },
//         uploadDir: async (localDirPath: string, remoteDirPath?: string) => {
//           status.uploadFromDir = true;
//         },
//         stat: async (remotePath: string) => {
//           status.stat = true;
//           return fileStat;
//         },
//         list: async (path?: string) => {
//           status.list = true;
//           return fileInfoList;
//         },
//         close: () => {
//           status.access = false;
//         },
//         //closed: !status.access,
//       };
//     }),
//   };
// });

beforeEach(() => {
  initializeStatus();
});

const dummyOption: RemoteConnection = new RemoteConnection();

describe('SFTP Test', () => {
  // console.log(baseFtp.Client);

  test('ftp download test', async () => {
    console.log(sftp);
    const client: Sftp = new Sftp(dummyOption);
    // jest.spyOn(client, 'connected', 'get').mockImplementation(() => {
    //   return status.access;
    // });
    //jest.spyOn(client, 'connected', 'get').mjest.spyOn(client, 'connected', 'get').mockReturnValue(status.access);
    let result = await client.download(
      new FileTransportInfo({
        sourceFolderName: 'test',
        sourceFilename: 'file',
        destinationFolderName: 'destination',
      })
    );
    expect(result.isSuccess()).toBeTruthy();
    expect(status.access).toBeTruthy();
    expect(status.downloadTo).toBeTruthy();
    expect(status.downloadToDir).toBeFalsy();
    //jest.spyOn(client, 'connected', 'get').mockReturnValue(status.access);
    let result2 = await client.close();
    expect(result2.isSuccess()).toBeTruthy();
    expect(status.access).toBeFalsy();

    //jest.spyOn(client, 'connected', 'get').mockReturnValue(status.access);
    result = await client.download(
      new FileTransportInfo({
        sourceFolderName: 'test',
        destinationFolderName: 'destination',
      })
    );
    expect(result.isSuccess()).toBeTruthy();
    expect(status.access).toBeTruthy();
    expect(status.downloadTo).toBeFalsy();
    expect(status.downloadToDir).toBeTruthy();
  });

  test('ftp upload test', async () => {
    const client: Sftp = new Sftp(dummyOption);
    // jest.spyOn(client, 'connected', 'get').mockImplementation(() => {
    //   return status.access;
    // });
    let result = await client.upload(
      new FileTransportInfo({
        sourceFolderName: 'test',
        sourceFilename: 'file',
        destinationFolderName: 'destination',
      })
    );
    expect(result.isSuccess()).toBeTruthy();
    expect(status.access).toBeTruthy();
    expect(status.uploadFrom).toBeTruthy();
    expect(status.uploadFromDir).toBeFalsy();
    expect(status.access).toBeTruthy();
    //jest.spyOn(client, 'connected', 'get').mockReturnValue(status.access);
    let result2 = await client.close();
    expect(result2.isSuccess()).toBeTruthy();
    expect(status.access).toBeFalsy();

    result = await client.upload(
      new FileTransportInfo({
        sourceFolderName: 'test',
        destinationFolderName: 'destination',
      })
    );
    expect(result.isSuccess()).toBeTruthy();
    expect(status.access).toBeTruthy();
    expect(status.uploadFrom).toBeFalsy();
    expect(status.uploadFromDir).toBeTruthy();
  });

  test('fileInfo test', async () => {
    const client: Sftp = new Sftp(dummyOption);
    // jest.spyOn(client, 'connected', 'get').mockImplementation(() => {
    //   return status.access;
    // });

    const result = await client.getFileInfo(
      new FileTransportInfo({
        sourceFolderName: 'test',
        sourceFilename: 'file',
        destinationFolderName: 'destination',
      })
    );
    if (result.isFailure()) {
      expect(result.isSuccess()).toBeTruthy();
      return;
    }
    expect(result.value.size).toBe(fileStat.size);
    expect(result.value.date).toEqual(createDateFromYYYYMMDD('19840101'));
  });

  test('list file test', async () => {
    const client: Sftp = new Sftp(dummyOption);
    // jest.spyOn(client, 'connected', 'get').mockImplementation(() => {
    //   return status.access;
    // });

    const result = await client.listFiles(
      new FileTransportInfo({
        sourceFolderName: 'test',
        destinationFolderName: 'destination',
      })
    );
    if (result.isFailure()) {
      expect(result.isSuccess()).toBeTruthy();
      return;
    }
    expect(result.value.length).toBe(2);
  });
});
