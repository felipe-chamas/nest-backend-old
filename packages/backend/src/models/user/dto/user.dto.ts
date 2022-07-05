import { Expose } from 'class-transformer';
import { User } from 'common/entities';

@Expose()
export class UserDto extends User {}
