module.exports = {
  type: 'mongodb',
  url: process.env.MONGODB_URI,
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  logging: false,
  entities: ['dist/**/*.entity{.ts,.js}'],
};
