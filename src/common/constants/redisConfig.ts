import 'dotenv/config'
const isTest = process.env.STAGE === 'test'
export const config = {
  host: isTest ? process.env.REDIS_TEST_HOST : process.env.REDIS_IO_HOST,
  port: isTest ? Number(process.env.REDIS_TEST_PORT) : Number(process.env.REDIS_IO_PORT),
  password: isTest ? process.env.REDIS_TEST_PASSWORD : process.env.REDIS_IO_PASSWORD
}
