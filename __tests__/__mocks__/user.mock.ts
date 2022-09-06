import { UserDto } from '@common/dto/entities/user.dto'
import { UpdateUserDto } from '@common/dto/update-user.dto'
import { Role } from '@common/enums/role.enum'

export const mockUser = {
  id: '624b3c3adb4b27a36fc4d450',
  uuid: '09649b73-9b23-4ec4-ae12-7b01891bac98',
  name: 'John Doe',
  email: 'john@gmail.com',
  account: '0x01',
  roles: []
} as unknown as UserDto

export const mockAdmin = {
  id: '326a2d5bba6b25a40bc4f143',
  name: 'Jane Doe',
  email: 'jane@falco.gg',
  account: '0x01',
  roles: [Role.USER_ADMIN, Role.ROLE_ADMIN, Role.NFT_ADMIN, Role.MARKETPLACE_ADMIN]
} as unknown as UserDto

export const mockCreateUser = {
  name: 'John Doe',
  email: 'joshn@email.com',
  roles: [],
  accountIds: [{ chainId: { namespace: 'eip155', reference: '1' }, address: '0x12345' }],
  socialAccounts: {
    discord: { id: 'asdasd', username: 'Juan' },
    steam: { id: 'asdsa32332', username: 'Odzen' }
  }
}

export const mockUpdateUser: Partial<UpdateUserDto> = {
  name: 'John Doe'
}
