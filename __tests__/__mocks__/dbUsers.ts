import { UserDto } from '@common/schemas/user.schema'

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

export const unboxUser: UserDto = {
  uuid: 'unboxUser',
  name: 'John Doe',
  email: 'john@gmail.com',
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
  imageUrl: 'test'
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

export const testUserWithWallet: UserDto = {
  uuid: 'userWithWallet',
  email: 'test@test.com',
  name: 'test',
  roles: [],
  accountIds: [
    {
      chainId: {
        namespace: 'solana',
        reference: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'
      },
      address: 'test'
    },
    {
      chainId: {
        namespace: 'eip155',
        reference: '56'
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
  imageUrl:
    'https://avatars.akamai.steamstatic.com/674a9766271127b634abd13b007cee93805f1bf9_full.jpg',
  wallet: {
    id: '91dd026f-b0cf-49a4-8fdb-b0d5f9878f2f',
    address: '0xC7E9f5e4728D1fcbf6665c00034Fe1737162c7D8',
    walletType: 'WHITE_LABEL',
    secretType: 'BSC',
    identifier: '62d91c64-62e0-4f96-aad2-5dadc5e57748',
    description: 'Extraordinary Wombat',
    createdAt: '2022-11-03T17:39:14.17098764'
  }
}
