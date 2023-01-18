/* eslint-disable @typescript-eslint/no-var-requires */
const axios = require('axios')
const ethers = require('ethers')

// Do not change function name.
const actionFn = async (context, alertEvent) => {
  console.log(alertEvent)

  // To access project's secret
  // let secret = await context.secrets.get('MY-SECRET')

  // To access project's storage
  // let value = await context.storage.getStr('MY-KEY')
  // await context.storage.putStr('MY-KEY', 'MY-VALUE')

  // Your logic goes here :)
  const abi = [
    'event Unboxed(uint256 indexed tokenId, address[] nfts, uint256[][] mintedTokenIds)',
    'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
    'event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)'
  ]
  const interface = new ethers.utils.Interface(abi)

  const logs = alertEvent.logs.map(({ data, topics }) => interface.parseLog({ data, topics }))
  const unbox = logs.filter((log) => log.name === 'Unboxed')[0]

  const chainId = {
    namespace: 'eip155',
    reference: alertEvent.network
  }

  const accountId = {
    chainId,
    address: alertEvent.from
  }

  const box = {
    namespace: alertEvent.logs[0].address,
    reference: unbox.args[0].toString()
  }
  const nfts = unbox.args[1].map((address, i) => ({
    namespace: address,
    references: unbox.args[2][i].map((id) => id.toString())
  }))

  const data = {
    accountId,
    box,
    nfts
  }

  const TbsApiKey = await context.secrets.get('TbsApiKey')

  const config = {
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': TbsApiKey
    }
  }
  await axios.post('http://kd1.apps.theharvestgame.com/nft/unbox', data, config)
}
// Do not change this.
module.exports = { actionFn }
