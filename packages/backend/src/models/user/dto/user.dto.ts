import { PartialType } from '@nestjs/mapped-types';
import { Exclude, Expose, Type } from 'class-transformer';
import { User } from 'common/entities';

@Expose()
export class UserDto extends PartialType(User) {
  @Exclude()
  password: string;

  @Expose()
  @Type(() => Date)
  createdAt: Date;
}
