import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createDateFromYYYYMMDD } from '../../dateOperation';
import { FileTransportInfo } from '../../fileModel';
import { Ftp } from '../ftp';
import { AccessOptions, FileInfo, UploadOptions } from 'basic-ftp';

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

const fileInfoList: FileInfo[] = [
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

vi.mock('basic-ftp', async () => {
  const actual = await vi.importActual<typeof import('basic-ftp')>('basic-ftp');
  class mockClient {
    ftp = {
      verbose: true,
    };
    access = async (options?: AccessOptions) => {
      initializeStatus();
      status.access = true;
    };
    downloadTo = async (
      _: Writable | string,
      __: string,
      ___?: number
    ) => {
      status.downloadTo = true;
    };
    downloadToDir = async (_: string, __?: string) => {
      status.downloadToDir = true;
    };
    uploadFrom = async (
      _: Readable | string,
      __: string,
      ___?: UploadOptions
    ) => {
      status.uploadFrom = true;
    };
    uploadFromDir = async (_: string, __?: string) => {
      status.uploadFromDir = true;
    };
    size = async (_: string) => {
      status.size = true;
      return 21;
    };
    lastMod = async (_: string) => {
      status.lastMod = true;
      return createDateFromYYYYMMDD('19840301');
    };
    list = async (_?: string) => {
      status.list = true;
      return fileInfoList;
    };
    close = () => {
      status.access = false;
    };
    //closed: !status.access,
  }
  return {
    ...actual,
    Client: mockClient,
    default: {
      ...actual,
      Client: mockClient,
    },
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
    expect(result.isOk()).toBeTruthy();
    expect(status.access).toBeTruthy();
    expect(status.downloadTo).toBeTruthy();
    expect(status.downloadToDir).toBeFalsy();
    //jest.spyOn(client, 'connected', 'get').mockReturnValue(status.access);
    const result2 = client.close();
    expect(result2.isOk()).toBeTruthy();
    expect(status.access).toBeFalsy();

    //jest.spyOn(client, 'connected', 'get').mockReturnValue(status.access);
    result = await client.download(
      new FileTransportInfo({
        sourceFolderName: 'test',
        destinationFolderName: 'destination',
      })
    );
    expect(result.isOk()).toBeTruthy();
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
    expect(result.isOk()).toBeTruthy();
    //jest.spyOn(client, 'connected', 'get').mockReturnValue(status.access);
    const result2 = client.close();
    expect(result2.isOk()).toBeTruthy();
    expect(status.access).toBeFalsy();

    result = await client.upload(
      new FileTransportInfo({
        sourceFolderName: 'test',
        destinationFolderName: 'destination',
      })
    );
    expect(result.isOk()).toBeTruthy();
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
    if (result.isErr()) {
      expect(result.isOk()).toBeTruthy();
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
    if (result.isErr()) {
      expect(result.isOk()).toBeTruthy();
      return;
    }
    expect(result.value.length).toBe(2);
  });
});
