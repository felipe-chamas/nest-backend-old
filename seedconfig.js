const config = require('./ormconfig.js');

module.exports = {
  ...config,
  entities: ['packages/backend/src/common/entities/index.ts'],
  seeds: ['packages/backend/src/database/seeds/*.seed{.ts,.js}'],
  factories: ['packages/backend/src/database/factories/*.factory{.ts,.js}'],
};
