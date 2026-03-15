import { NodeSSH } from 'node-ssh';
import { RemoteConnection } from './remoteConnection.js';
import { GyomuResultAsync, okAsync, runAsync } from '../result.js';
import { Scp } from './scp.js';
import { NetworkError } from '../errors.js';

export class SSH implements Disposable {
  #connectionInformation: RemoteConnection;
  constructor(connectionConfig: RemoteConnection) {
    this.#connectionInformation = connectionConfig;
    this.client = new NodeSSH();
  }

  client: NodeSSH;
  get connected() {
    return this.client.isConnected();
  }
  #init() {
    return runAsync(
      async () => {
        await this.client.connect({
          host: this.#connectionInformation.serverURL,
          username: this.#connectionInformation.userId,
          password: this.#connectionInformation.password,
          port: this.#connectionInformation.port,
          privateKeyPath: this.#connectionInformation.privateKeyFilename,
        });
        return true;
      },
      NetworkError,
      'Fail to do ssh conneciton',
    );
  }

  execute(
    command: string,
    options: {
      requireShell?: boolean;
      workingDirectory?: string;
      noTrimOutput?: boolean;
    },
  ): GyomuResultAsync<{
    exitCode: number | null;
    result: string;
    error: string;
  }> {
    const initResult = this.connected ? okAsync(true) : this.#init();
    return initResult.andThen(() =>
      runAsync(
        async () => {
          let cmd = command;
          if (options.requireShell ?? true)
            cmd = 'source ~/.bashrc\n' + command;
          const result = await this.client.execCommand(cmd, {
            cwd: options.workingDirectory,
            noTrim: options.noTrimOutput ?? false,
            encoding: 'utf8',
          });
          return {
            exitCode: result.code,
            result: result.stdout,
            error: result.stderr,
          };
        },
        NetworkError,
        `Server:${this.#connectionInformation.serverURL} UserID:${this.#connectionInformation.userId}\nCommand:${command}`,
      ),
    );
  }
  [Symbol.dispose](): void {
    if (this.client.isConnected()) this.client.dispose();
  }
  close() {
    if (this.client.isConnected()) this.client.dispose();
  }
  getScp() {
    return new Scp(this.#connectionInformation);
  }
}
