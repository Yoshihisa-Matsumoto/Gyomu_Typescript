import sftp from 'ssh2-sftp-client';
import { vi } from 'vitest';
import { mockDeep } from 'vitest-mock-extended';

vi.mock('ssh2-sftp-client', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        default: mockDeep<sftp>(),
      };
    }),
  };
});
