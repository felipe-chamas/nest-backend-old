export default () => ({
  port: parseInt(process.env.PORT, 10) || 3333,
  env: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.MONGO_CONN_STRING,
    dbName: process.env.DB_NAME,
    userName: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  },
});
