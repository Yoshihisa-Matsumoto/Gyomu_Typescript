module.exports = {
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.+.test.(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleFileExtensions: ['js', 'tsx', 'ts', 'd.ts'],
  clearMocks: true,
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/baseDBClass.ts'],
  preset: 'ts-jest',
};
