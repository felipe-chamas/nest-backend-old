import { ObjectId } from 'mongoose'

import { Role } from '@common/enums/role.enum'
import { UserDocument, UserDto } from '@common/schemas/user.schema'
import { UserService } from '@services/user.service'

import { mockWithMongooseMethodChaining } from './utils'

export const mockUser: Partial<UserDocument> = {
  uuid: '09649b73-9b23-4ec4-ae12-7b01891bac98',
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
  wallet: {
    id: '1234567890',
    address: '0xB3f467ea508529e7BE0780373C3F87e22688c927',
    walletType: 'WHITE_LABEL',
    secretType: 'ETHEREUM',
    identifier: '12345',
    description: 'test wallet',
    createdAt: '2022-05-14'
  }
}

export const mockUserWithoutWallet: Partial<UserDocument> = {
  uuid: 'ed1d7898-b716-437b-bf70-bf6bf99d7fda',
  name: 'Jane Doe',
  email: 'jane@gmail.com'
}

export const mockAdmin: Partial<UserDocument> = {
  ...mockUser,
  roles: [Role.USER_ADMIN, Role.ROLE_ADMIN, Role.NFT_ADMIN, Role.MARKETPLACE_ADMIN]
}
export const testSteamId = '76561199405194880'
export const findOrCreateBySteamIdResponse = {
  success: true,
  result: [
    {
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
  ]
}
type UserResult = UserDocument & { _id: ObjectId }

export const testElixirJwt = 'fajskfsfasfnwerjsadfxlvcxziouwefsd'
export const testElixirId = '1238014'

export const mockUserService: Partial<UserService> = {
  findByUUID: jest.fn().mockImplementation(async (uuid: string) => {
    const user =
      [mockUser, mockUserWithoutWallet, mockAdmin].find((user) => user.uuid === uuid) || null
    return user as UserResult
  }),
  update: (_: string, updatedUser: Partial<UserDto>) =>
    Promise.resolve({
      ...mockUser,
      ...updatedUser
    } as UserResult),
  remove: jest.fn(),

  findOrCreateBySteamId: jest.fn().mockImplementation(async (steamId: string) => {
    if (!steamId) throw new Error('Required data missing')
    return findOrCreateBySteamIdResponse.result
  }),

  findOrCreateElixirUser: jest.fn().mockImplementation(async (jwt: string, elixirId: string) => {
    if (jwt && elixirId) {
      return mockUser
    }
  })
}

export const userModelMockFactory = jest.fn().mockImplementation(() => ({
  findOne: mockWithMongooseMethodChaining(mockUser),
  findOneAndUpdate: mockWithMongooseMethodChaining(mockUser),
  find: mockWithMongooseMethodChaining([mockUser, mockAdmin]),
  deleteOne: mockWithMongooseMethodChaining(undefined),
  save: jest.fn().mockReturnValue(mockUser)
}))
