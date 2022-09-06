module.exports = {
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json'
    }
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  testRegex: '.spec.ts$',
  rootDir: '..',
  roots: ['<rootDir>/__tests__/unit'],
  moduleDirectories: ['node_modules', '<rootDir>'],
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
    '@routes': '<rootDir>/src/routes.ts',
    '@strategies/(.*)': '<rootDir>/src/strategies/$1',
    '@common/(.*)': '<rootDir>/src/common/$1',
    '@controllers/(.*)': '<rootDir>/src/controllers/$1',
    '@decorators/(.*)': '<rootDir>/src/decorators/$1',
    '@modules/(.*)': '<rootDir>/src/modules/$1',
    '@services/(.*)': '<rootDir>/src/services/$1',
    '__mocks__/(.*)': '<rootDir>/__tests__/__mocks__/$1'
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: './coverage'
}
