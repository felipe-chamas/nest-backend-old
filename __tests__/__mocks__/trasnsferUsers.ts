export const transferUser1 = {
  uuid: 'TransferUser1',
  name: 'John Doe',
  roles: [],
  accountIds: [
    {
      chainId: {
        namespace: 'test',
        reference: 'test'
      },
      address: 'test'
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

export const transferUser2 = {
  uuid: 'TransferUser2',
  name: 'John Doe',
  roles: [],
  accountIds: [
    {
      chainId: {
        namespace: 'test',
        reference: 'test'
      },
      address: 'test'
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
    id: 'e5e3bace-efb4-4ba3-b249-9cd88a0a0012',
    address: '0x79D869Ab071C060Af22cc2B1331837aEe1Feb090', // must be a real address
    walletType: 'WHITE_LABEL',
    secretType: 'BSC',
    identifier: 'transferTest',
    description: 'Lovable Octopus',
    createdAt: '2022-12-21T14:43:34.923731602'
  }
}
