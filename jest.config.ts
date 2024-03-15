import type { Config } from 'jest';

const config: Config = {
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**',
  ],
  coveragePathIgnorePatterns: [
    'src/middlewares/logger',
  ]
};

export default config;