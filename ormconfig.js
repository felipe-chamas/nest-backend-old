module.exports = {
  type: 'mongodb',
  url: process.env.MONGODB_URI || 'mongodb://localhost:27017/database',
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  logging: false,
  entities: ['dist/**/*.entity{.ts,.js}'],
};
