import { IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  accountId: string;

  @IsString()
  bearerToken: string;
}
