import { Role } from '@common/enums/role.enum'
import { UserDocument } from '@common/schemas/user.schema'

export const mockUser: Partial<UserDocument> = {
  _id: '624b3c3adb4b27a36fc4d450',
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
  roles: []
}

export const mockAdmin: Partial<UserDocument> = {
  ...mockUser,
  roles: [Role.USER_ADMIN, Role.ROLE_ADMIN, Role.NFT_ADMIN, Role.MARKETPLACE_ADMIN]
}
