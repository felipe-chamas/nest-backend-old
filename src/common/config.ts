export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  stage: process.env.STAGE || 'development',
  session_secret: process.env.SESSION_SECRET,
  redis_url: process.env.REDIS_URL,
  redis_io_url: process.env.REDIS_IO_URL,
  mongo_uri:
    process.env.NODE_ENV === 'test' ? process.env.MONGODB_CICD_URI : process.env.MONGODB_URI,
  docs: {
    token: process.env.DOCS_TOKEN
  },
  discord: {
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    redirectURL: process.env.DISCORD_REDIRECT_URI
  },
  steam: {
    returnURL: process.env.STEAM_RETURN_URL,
    realm: process.env.STEAM_REALM,
    apiKey: process.env.STEAM_API_KEY
  },
  elixir: {
    apiKey: process.env.ELIXIR_API_KEY
  },
  epic: {
    clientID: process.env.EPIC_CLIENT_ID,
    clientSecret: process.env.EPIC_SECRET_KEY,
    deploymentID: process.env.EPIC_DEPLOYMENT_ID
  },
  frontend_url: process.env.FRONTEND_URL,
  quicknode: {
    quicknode_uri: process.env.QUICKNODE_URI
  },
  venly: {
    client_id: process.env.VENLY_CLIENT_ID,
    client_secret: process.env.VENLY_CLIENT_SECRET,
    application_id: process.env.VENLY_APPLICATION_ID
  },
  apiKey: process.env.API_KEY,
  moralis: {
    apiKey: process.env.MORALIS_API_KEY
  },
  slack: {
    slackUrl: process.env.SLACK_URL
  },
  unbox: {
    contractAddress: process.env.UNBOX_ADDRESS
  },
  operator: {
    walletId: process.env.BRIDGE_DESTINATION_WALLET_ID,
    walletPinCode: process.env.BRIDGE_DESTINATION_WALLET_PIN_CODE,
    walletMinimumBalance: process.env.NODE_ENV === 'production' ? 1 : 0.5
  },
  bridge: {
    sourceAccountId: process.env.BRIDGE_SOURCE_ACCOUNT_ID,
    sourceAssetTypes: process.env.BRIDGE_SOURCE_ASSET_TYPES
      ? process.env.BRIDGE_SOURCE_ASSET_TYPES.split(',')
      : [],
    destinationAssetTypes: process.env.BRIDGE_DESTINATION_ASSET_TYPES
      ? process.env.BRIDGE_DESTINATION_ASSET_TYPES.split(',')
      : []
  },
  topuper: {
    id: process.env.TOPUPER_WALLET_ID,
    minBalance: process.env.TOPUPER_MIN_BALANCE,
    userMinBalance: process.env.TOPUPER_USER_MIN_BALANCE,
    userRefill: process.env.TOPUPER_USER_REFILL,
    pincode: process.env.TOPUPER_WALLET_PINCODE
  },
  pepper: process.env.PEPPER
})
