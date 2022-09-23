module.exports = {
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__sit__/?(*.)+(test).+(ts|tsx|js)',
    // '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleFileExtensions: ['js', 'tsx', 'ts', 'd.ts'],
  clearMocks: true,
  preset: 'ts-jest',
};
