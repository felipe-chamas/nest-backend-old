import { UpdateUserDto } from '../../models/user/dto/update-user.dto';
import { CreateUserDto } from '../../models/user/dto/create-user.dto';
import { User } from '../../common/entities/user.entity';

export const mockUser = {
  id: '624b3c3adb4b27a36fc4d450',
  name: 'John Doe',
  email: 'john@gmail.com',
  account: '0x01',
} as unknown as User;

export const mockCreateUser: CreateUserDto = {
  name: 'John Doe',
  email: 'joshn@email.com',
  password: '12345678@Abc',
  isAdmin: false,
  address: [],
  account: '0x12345',
};

export const mockUpdateUser: Partial<UpdateUserDto> = {
  name: 'John smith',
};
