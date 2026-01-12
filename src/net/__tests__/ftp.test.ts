import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createDateFromYYYYMMDD } from '../../dateOperation';
import { FileTransportInfo } from '../../fileModel';
import { Ftp } from '../ftp';
import baseFtp = require('basic-ftp');
import { RemoteConnection } from '../remoteConnection';
import { Readable, Writable } from 'stream';

let status = {
  access: false,
  downloadTo: false,
  downloadToDir: false,
  uploadFrom: false,
  uploadFromDir: false,
  size: false,
  lastMod: false,
  list: false,
};
const initializeStatus = () => {
  status = {
    access: false,
    downloadTo: false,
    downloadToDir: false,
    uploadFrom: false,
    uploadFromDir: false,
    size: false,
    lastMod: false,
    list: false,
  };
};
let fileInfoList: baseFtp.FileInfo[] = [
  {
    name: '1',
    type: 1,
    size: 2,
    isDirectory: false,
    isSymbolicLink: false,
    isFile: true,
    date: '',
    rawModifiedAt: '',
  },
  {
    name: '2',
    type: 1,
    size: 2,
    isDirectory: false,
    isSymbolicLink: false,
    isFile: true,
    date: '',
    rawModifiedAt: '',
  },
];
vi.mock('basic-ftp', () => {
  return {
    Client: vi.fn().mockImplementation(() => {
      return {
        ftp: {
          verbose: true,
        },
        access: async (options?: baseFtp.AccessOptions) => {
          initializeStatus();
          status.access = true;
        },
        downloadTo: async (
          destination: Writable | string,
          fromRemotePath: string,
          startAt?: number
        ) => {
          status.downloadTo = true;
        },
        downloadToDir: async (localDirPath: string, remoteDirPath?: string) => {
          status.downloadToDir = true;
        },
        uploadFrom: async (
          source: Readable | string,
          toRemotePath: string,
          options?: baseFtp.UploadOptions
        ) => {
          status.uploadFrom = true;
        },
        uploadFromDir: async (localDirPath: string, remoteDirPath?: string) => {
          status.uploadFromDir = true;
        },
        size: async (path: string) => {
          status.size = true;
          return 21;
        },
        lastMod: async (path: string) => {
          status.lastMod = true;
          return createDateFromYYYYMMDD('19840301');
        },
        list: async (path?: string) => {
          status.list = true;
          return fileInfoList;
        },
        close: () => {
          status.access = false;
        },
        //closed: !status.access,
      };
    }),
  };
});

beforeEach(() => {
  initializeStatus();
});
const dummyOption: RemoteConnection = new RemoteConnection();

describe('FTP Test', () => {
  // console.log(baseFtp.Client);
  test('ftp download test', async () => {
    const client: Ftp = new Ftp(dummyOption);
    vi.spyOn(client, 'connected', 'get').mockImplementation(() => {
      return status.access;
    });
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
    let result2 = client.close();
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
    const client: Ftp = new Ftp(dummyOption);
    vi.spyOn(client, 'connected', 'get').mockImplementation(() => {
      return status.access;
    });
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
    let result2 = client.close();
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
    const client: Ftp = new Ftp(dummyOption);
    vi.spyOn(client, 'connected', 'get').mockImplementation(() => {
      return status.access;
    });

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
    expect(result.value.size).toBe(21);
    expect(result.value.date).toEqual(createDateFromYYYYMMDD('19840301'));
  });

  test('list file test', async () => {
    const client: Ftp = new Ftp(dummyOption);
    vi.spyOn(client, 'connected', 'get').mockImplementation(() => {
      return status.access;
    });

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
