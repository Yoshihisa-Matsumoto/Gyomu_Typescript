import { GyomuResultAsync, okAsync, runAsync } from '../result.js';
import { NetworkError } from '../errors.js';
import { RemoteConnection } from './remoteConnection.js';
import { FileTransportInfo } from '../fileModel.js';
import { platform } from '../platform/index.js';

import { Client as ScpClient } from 'node-scp';
import { Readable } from 'stream';

export class Scp {
  #config: RemoteConnection;
  constructor(connectionConfig: RemoteConnection) {
    this.#config = connectionConfig;
    this.client = undefined as unknown as Awaited<ReturnType<typeof ScpClient>>;
    this.connected = false;
  }

  client: Awaited<ReturnType<typeof ScpClient>>;
  connected: boolean;

  #init(): GyomuResultAsync<boolean> {
    return runAsync(
      async () => {
        const opts: any = {
          host: this.#config.serverURL,
          port: this.#config.port,
          username: this.#config.userId,
        };
        if (this.#config.privateKeyFilename) {
          opts.privateKey = platform.readFileSync(
            this.#config.privateKeyFilename,
          );
          if (this.#config.password) opts.passphrase = this.#config.password;
        } else {
          opts.password = this.#config.password;
        }
        this.client = await ScpClient(opts);
        this.connected = true;
        return true;
      },
      NetworkError,
      'Fail to do SCP connection',
    );
  }

  // Normalize to remote-friendly path (forward slashes)
  #normRemote(p: string): string {
    return p.replaceAll(platform.sep, '/');
  }

  download(transportInformation: FileTransportInfo): GyomuResultAsync<boolean> {
    const initResult = this.connected ? okAsync(true) : this.#init();
    return initResult.andThen(() => {
      const promise: () => Promise<void> =
        transportInformation.isSourceDirectory
          ? async () => {
              await this.client.downloadDir(
                this.#normRemote(transportInformation.sourceFolderName),
                transportInformation.destinationPath,
              );
            }
          : async () => {
              await this.client.downloadFile(
                this.#normRemote(transportInformation.sourceFullName),
                transportInformation.destinationFullName,
              );
            };

      return runAsync(promise, NetworkError, 'Fail to do SCP download').map(
        () => true,
      );
    });
  }

  upload(transportInformation: FileTransportInfo): GyomuResultAsync<boolean> {
    const initResult = this.connected ? okAsync(true) : this.#init();
    return initResult.andThen(() => {
      const promise = transportInformation.isSourceDirectory
        ? () =>
            this.client.uploadDir(
              transportInformation.sourceFullName,
              this.#normRemote(transportInformation.destinationFullName),
            )
        : () =>
            this.client.uploadFile(
              transportInformation.sourceFullName,
              this.#normRemote(transportInformation.destinationFullName),
            );

      return runAsync(promise, NetworkError, 'Fail to do SCP upload').map(
        () => true,
      );
    });
  }

  // Upload from memory (Buffer or Readable) to remote path
  uploadStream(
    input: Buffer | Readable,
    remoteFullPath: string,
  ): GyomuResultAsync<boolean> {
    const initResult = this.connected ? okAsync(true) : this.#init();
    return initResult.andThen(() => {
      const promise = async () => {
        const remotePath = this.#normRemote(remoteFullPath);
        // node-scp does not expose direct stream upload; create a temp local file when Buffer
        if (Buffer.isBuffer(input)) {
          const tmp = platform.join(platform.tmpdir(), `scp_tmp_${Date.now()}`);
          await platform.writeFile(tmp, input);
          await this.client.uploadFile(tmp, remotePath);
          await platform.remove(tmp);
          return;
        }
        // For Readable, write to temp and then upload
        const tmp = platform.join(platform.tmpdir(), `scp_tmp_${Date.now()}`);
        await new Promise<void>((resolve, reject) => {
          const ws = platform.createWriteStream(tmp);
          (input as Readable)
            .pipe(ws)
            .once('error', reject)
            .once('finish', () => resolve());
        });
        await this.client.uploadFile(tmp, remotePath);
        await platform.remove(tmp);
      };

      return runAsync(
        promise,
        NetworkError,
        'Fail to upload stream via SCP',
      ).map(() => true);
    });
  }

  // Download remote file into memory (Buffer) or as Readable
  downloadToBuffer(remoteFullPath: string): GyomuResultAsync<Buffer> {
    const initResult = this.connected ? okAsync(true) : this.#init();
    return initResult.andThen(() => {
      const promise = async () => {
        const remotePath = this.#normRemote(remoteFullPath);
        const tmp = platform.join(platform.tmpdir(), `scp_tmp_${Date.now()}`);
        await this.client.downloadFile(remotePath, tmp);
        const buf = await platform.readFile(tmp);
        await platform.remove(tmp);
        return buf;
      };
      return runAsync(promise, NetworkError, 'Fail to download into memory');
    });
  }

  downloadToStream(remoteFullPath: string): GyomuResultAsync<Readable> {
    const initResult = this.connected ? okAsync(true) : this.#init();
    return initResult.andThen(() => {
      const promise = async () => {
        const remotePath = this.#normRemote(remoteFullPath);
        const tmp = platform.join(platform.tmpdir(), `scp_tmp_${Date.now()}`);
        await this.client.downloadFile(remotePath, tmp);
        return platform.createReadStream(tmp);
      };
      return runAsync(promise, NetworkError, 'Fail to download stream via SCP');
    });
  }

  close(): GyomuResultAsync<boolean> {
    if (!this.connected) return okAsync(true);
    return runAsync(
      async () => {
        await this.client.close();
        this.connected = false;
        return true;
      },
      NetworkError,
      'Fail to close SCP connection',
    );
  }
}
