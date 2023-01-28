import 'dotenv/config'
import slackAlert from '../slack'

export default function getEnv(name: string): string {
  const envs = {
    MONGODB_CICD_URI: process.env.MONGODB_CICD_URI,
    VENLY_CLIENT_ID: process.env.VENLY_CLIENT_ID,
    VENLY_CLIENT_SECRET: process.env.VENLY_CLIENT_SECRET,
    STAGE: process.env.STAGE,
    MONGODB_URI: process.env.MONGODB_URI,
    PEPPER: process.env.PEPPER,
    REDIS_TEST_HOST: process.env.REDIS_TEST_HOST,
    REDIS_TEST_PORT: process.env.REDIS_TEST_PORT,
    REDIS_TEST_PASSWORD: process.env.REDIS_TEST_PASSWORD,
    REDIS_IO_HOST: process.env.REDIS_IO_HOST,
    REDIS_IO_PORT: process.env.REDIS_IO_PORT,
    REDIS_IO_PASSWORD: process.env.REDIS_IO_PASSWORD,
    SLACK_URL: process.env.SLACK_URL
  }

  if (!envs[name]) {
    console.log(`lost env ${name}`)
    slackAlert(`lost env ${name}`)
  }

  return envs[name]
}
