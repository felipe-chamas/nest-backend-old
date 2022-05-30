module.exports = {
  displayName: 'backend',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  roots: ['<rootDir>/src'],
  moduleDirectories: ['node_modules', '<rootDir>'],
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/$1',
    '@common/(.*)': '<rootDir>/common/$1',
    '@models/(.*)': '<rootDir>/models/$1',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/backend',
};
