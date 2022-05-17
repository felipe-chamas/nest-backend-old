import { PartialType } from '@nestjs/mapped-types';
import { Expose, Type } from 'class-transformer';
import { User } from 'common/entities';

@Expose()
export class UserDto extends PartialType(User) {
  @Expose()
  @Type(() => Date)
  createdAt: Date;
}
