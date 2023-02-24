import { UserDto } from '@common/schemas/user.schema'

export const transferUser1: UserDto = {
  uuid: 'TransferUser1',
  email: 'test@test.com',
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
  imageUrl: 'test'
}

export const transferUser2: UserDto = {
  uuid: 'TransferUser2',
  email: 'test@test.com',
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
  imageUrl: 'test'
}
