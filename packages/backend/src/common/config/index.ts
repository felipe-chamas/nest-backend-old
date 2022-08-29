export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  stage: process.env.STAGE || 'development',
  sqs: {
    queueUrl: process.env.EVENTS_QUEUE_URL,
  },
  blockchain: {
    jsonRpcProvider: {
      '1': process.env.ETHEREUM_MAINNET_RPC_PROVIDER,
      '5': process.env.GOERLI_TESTNET_RPC_PROVIDER,
      '56': process.env.BINANCE_MAINNET_RPC_PROVIDER,
      '97': process.env.BINANCE_TESTNET_RPC_PROVIDER,
    },
  },
  throttler: {
    ttl: process.env.THROTTLER_TTL || '1m',
    limit: process.env.THROTTLER_LIMIT || '10/1m',
    throttler: process.env.THROTTLER_MAX || '100/1m',
  },
  session_secret: process.env.SESSION_SECRET,
  redis_url: process.env.REDIS_URL,
  docs: {
    token: process.env.DOCS_TOKEN,
  },
  discord: {
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    redirectURL: process.env.DISCORD_REDIRECT_URI,
  },
  steam: {
    returnURL: process.env.STEAM_RETURN_URL,
    realm: process.env.STEAM_REALM,
    apiKey: process.env.STEAM_API_KEY,
  },
  frontend_url: process.env.FRONTEND_URL,
  quicknode: {
    quicknode_uri: process.env.QUICKNODE_URI,
  },
  venly: {
    client_id: process.env.VENLY_CLIENT_ID,
    client_secret: process.env.VENLY_CLIENT_SECRET,
    application_id: process.env.VENLY_APPLICATION_ID,
  },
  apiKey: process.env.API_KEY,
  moralis: {
    apiKey: process.env.MORALIS_API_KEY,
  },
});
