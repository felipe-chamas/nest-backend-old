module.exports = {
  type: 'mongodb',
  url: process.env.MONGODB_URI || 'mongodb://localhost:27017/database',
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  logging: false,
  entities:
    process.env.NODE_ENV === undefined
      ? ['packages/backend/src/common/entities/index.ts']
      : ['dist/**/*.entity{.ts,.js}'],
  seeds: ['packages/backend/src/database/seeds/*.seed{.ts,.js}'],
  factories: ['packages/backend/src/database/factories/*.factory{.ts,.js}'],
};
