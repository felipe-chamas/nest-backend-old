/* eslint-disable @typescript-eslint/no-var-requires */
const baseConfig = require('./jest.config.js')

module.exports = {
  ...baseConfig,
  roots: ['<rootDir>/__tests__/e2e']
}
