module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.ts': 'ts-jest',
  },
  testRegex: 'test.ts',
  moduleFileExtensions: ['ts', 'js'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
}
