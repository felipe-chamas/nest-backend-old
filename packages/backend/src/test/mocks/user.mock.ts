import { UpdateUserDto } from '../../models/user/dto/update-user.dto';
import { CreateUserDto } from '../../models/user/dto/create-user.dto';
import { User } from '../../models/user/entities/user.entity';

export const mockUser = {
  id: '624b3c3adb4b27a36fc4d450',
  name: 'John Doe',
  email: 'john@gmail.com',
  address: ['123 Main St', 'Anytown', 'CA', '90210'],
} as unknown as User;

export const mockCreateUser: CreateUserDto = {
  name: 'John Doe',
  email: 'joshn@email.com',
};

export const mockUpdateUser: Partial<UpdateUserDto> = {
  name: 'John smith',
};
