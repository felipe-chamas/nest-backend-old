export default () => ({
  port: parseInt(process.env.PORT, 10) || 3333,
  env: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.MONGO_CONN_STRING,
    dbName: process.env.DB_NAME,
    userName: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  },
  sqs: {
    queueUrl:
      process.env.AWS_SQS_QUEUE_URL ||
      'https://sqs.us-east-1.amazonaws.com/166126423048/events-listener-develop-queue',
  },
});
