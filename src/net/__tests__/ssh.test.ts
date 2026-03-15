import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SSH } from '../ssh.js';
import { RemoteConnection } from '../remoteConnection.js';

type ExecResult = { code: number | null; stdout: string; stderr: string };

let isConnectedState = false;
const connectMock = vi.fn(async () => {
  isConnectedState = true;
});
/* eslint-disable @typescript-eslint/no-unused-vars */
const execCommandMock = vi.fn(
  async (_cmd: string, _opts: any): Promise<ExecResult> => {
    return { code: 0, stdout: 'ok', stderr: '' };
  },
);
const disposeMock = vi.fn(() => {
  isConnectedState = false;
});
const isConnectedMock = vi.fn(() => isConnectedState);

vi.mock('node-ssh', () => {
  class NodeSSH {
    connect = connectMock;
    execCommand = execCommandMock;
    dispose = disposeMock;
    isConnected = isConnectedMock;
  }
  return { NodeSSH };
});

beforeEach(() => {
  isConnectedState = false;
  connectMock.mockClear();
  execCommandMock.mockClear();
  disposeMock.mockClear();
  isConnectedMock.mockClear();
});

const makeConn = (): RemoteConnection => {
  const rc = new RemoteConnection();
  rc.serverURL = 'example.com';
  rc.userId = 'user';
  rc.password = 'pass';
  rc.port = 22;
  rc.privateKeyFilename = '/home/user/.ssh/id_rsa';
  return rc;
};

describe('SSH', () => {
  it('connected getter reflects inverse of client.isConnected()', () => {
    const ssh = new SSH(makeConn());
    // initial mock is not connected
    expect(isConnectedMock).toHaveBeenCalledTimes(0);
    expect(ssh.connected).toBe(false); // !false
    // flip to connected
    isConnectedState = true;
    expect(ssh.connected).toBe(true); // !true
  });

  it('execute prefixes shell by default and passes options to execCommand', async () => {
    const ssh = new SSH(makeConn());
    const res = await ssh.execute('echo hello', { workingDirectory: '/tmp' });

    expect(execCommandMock).toHaveBeenCalledTimes(1);
    const [calledCmd, calledOpts] = execCommandMock.mock.calls[0] as [
      string,
      any,
    ];
    expect(calledCmd).toContain('source ~/.bashrc');
    expect(calledCmd).toContain('echo hello');
    expect(calledOpts.cwd).toBe('/tmp');
    expect(calledOpts.noTrim).toBe(false);
    expect(calledOpts.encoding).toBe('utf8');

    expect(res.isOk()).toBe(true);
    if (res.isOk()) {
      expect(res.value.exitCode).toBe(0);
      expect(res.value.result).toBe('ok');
      expect(res.value.error).toBe('');
    }
  });

  it('execute does not prefix shell when requireShell=false', async () => {
    const ssh = new SSH(makeConn());
    const res = await ssh.execute('whoami', {
      requireShell: false,
      noTrimOutput: true,
    });
    expect(execCommandMock).toHaveBeenCalledTimes(1);
    const [calledCmd, calledOpts] = execCommandMock.mock.calls[0] as [
      string,
      any,
    ];
    expect(calledCmd.startsWith('source ~/.bashrc')).toBe(false);
    expect(calledCmd).toBe('whoami');
    expect(calledOpts.noTrim).toBe(true);
    expect(res.isOk()).toBe(true);
  });

  it('execute returns Failure when connect throws (message matches init error text)', async () => {
    // Make the client appear connected so SSH.#init() is triggered (due to connected getter logic)
    isConnectedState = false;
    connectMock.mockImplementationOnce(async () => {
      throw new Error('connect failed');
    });
    const ssh = new SSH(makeConn());
    const res = await ssh.execute('ls', {} as any);
    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      // Note: message comes from ssh.ts "Fail to do ssh conneciton" (typo preserved)
      expect(res.error.message).toBe('Fail to do ssh conneciton');
    }
  });

  it('execute returns Failure when execCommand throws and includes server/user/command in message', async () => {
    execCommandMock.mockImplementationOnce(async () => {
      throw new Error('exec failed');
    });
    const ssh = new SSH(makeConn());
    const res = await ssh.execute('uptime', {} as any);
    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      expect(res.error.message).toBe(
        'Server:example.com UserID:user\nCommand:uptime',
      );
    }
  });

  it('dispose/close call client.dispose only when connected', () => {
    const ssh = new SSH(makeConn());
    // not connected -> dispose should not call
    ssh[Symbol.dispose]();
    expect(disposeMock).toHaveBeenCalledTimes(0);

    // connect and then dispose
    isConnectedState = true;
    ssh[Symbol.dispose]();
    expect(disposeMock).toHaveBeenCalledTimes(1);

    // connect and then close
    isConnectedState = true;
    ssh.close();
    expect(disposeMock).toHaveBeenCalledTimes(2);
  });
});
