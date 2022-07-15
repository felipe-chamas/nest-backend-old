import { UpdateUserDto } from '../../models/user/dto/update-user.dto';
import { User } from '../../common/entities/user.entity';
import { Role } from 'common/enums/role.enum';

export const mockUser = {
  id: '624b3c3adb4b27a36fc4d450',
  name: 'John Doe',
  email: 'john@gmail.com',
  account: '0x01',
  roles: [],
} as unknown as User;

export const mockAdmin = {
  id: '326a2d5bba6b25a40bc4f143',
  name: 'Jane Doe',
  email: 'jane@falco.gg',
  account: '0x01',
  roles: [
    Role.USER_ADMIN,
    Role.ROLE_ADMIN,
    Role.NFT_ADMIN,
    Role.MARKETPLACE_ADMIN,
  ],
} as unknown as User;

export const mockCreateUser = {
  name: 'John Doe',
  email: 'joshn@email.com',
  roles: [],
  accountIds: [
    { chainId: { namespace: 'eip155', reference: '1' }, address: '0x12345' },
  ],
  socialAccounts: {
    discordUser: '',
    instagramUser: '',
    twitterUser: '',
    youtubeUser: '',
  },
};

export const mockUpdateUser: Partial<UpdateUserDto> = {
  name: 'John Doe',
};
