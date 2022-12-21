export const walletUser = {
  uuid: 'testUser',
  name: 'John Doe',
  email: 'john@gmail.com',
  accountIds: [
    {
      chainId: {
        namespace: 'eip155',
        reference: '56'
      },
      address: '0xE9f9245615A4571d322fe6EA03Ab82C44b432CEa'
    }
  ],
  roles: []
}

export const unboxUser = {
  uuid: 'unboxUser',
  name: 'John Doe',
  roles: [],
  accountIds: [
    {
      chainId: {
        namespace: 'solana',
        reference: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'
      },
      address: '63byhRW3U3E8xJfCP66LMxn2TQLi4vN7Jncg5C26q7Ac'
    },
    {
      chainId: {
        namespace: 'eip155',
        reference: '56'
      },
      address: '0xb3f467ea508529e7be0780373c3f87e22688c927'
    }
  ],
  socialAccounts: {
    steam: {
      id: 'test',
      username: 'test'
    }
  },
  imageUrl: 'test',
  wallet: {
    id: '91dd026f-b0cf-49a4-8fdb-b0d5f9878f2f',
    address: '0xC7E9f5e4728D1fcbf6665c00034Fe1737162c7D8', // must be a real wallet address
    walletType: 'WHITE_LABEL',
    secretType: 'BSC',
    identifier: '62d91c64-62e0-4f96-aad2-5dadc5e57748',
    description: 'Extraordinary Wombat',
    createdAt: '2022-11-03T17:39:14.17098764'
  }
}

export const testSteamId = '76561199405194880'
export const steamNoImageUser = {
  uuid: 'testUserNoImage',
  name: 'John Doe',
  email: 'john@gmail.com',
  accountIds: [
    {
      chainId: {
        namespace: 'eip155',
        reference: '56'
      },
      address: '0xE9f9245615A4571d322fe6EA03Ab82C44b432CEa'
    }
  ],
  roles: [],
  socialAccounts: { steam: { id: testSteamId, username: 'John Doe' } }
}
