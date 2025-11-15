
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  projects: [
    {
      displayName: 'jsdom',
      testEnvironment: 'jest-environment-jsdom',
      testMatch: ['**/__tests__/**/*.test.tsx'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      transform: {
        '^.+\\.(ts|tsx|js|jsx)$': ['babel-jest', { presets: ['next/babel'] }],
      },
      transformIgnorePatterns: [
        '/node_modules/(?!lucide-react)/'
      ],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    },
    {
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: ['**/__tests__/**/*.test.ts'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      transform: {
        '^.+\\\.ts$': ['babel-jest', { presets: [['@babel/preset-env', {targets: {node: 'current'}}], '@babel/preset-typescript'] }],
      },
    },
  ],
};
