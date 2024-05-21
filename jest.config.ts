import type { Config } from 'jest';

const config: Config = {
  preset: '@shelf/jest-mongodb',
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  collectCoverage: true,
  collectCoverageFrom: ['src/**'],
  coveragePathIgnorePatterns: ['src/config/db'],
};

export default config;
