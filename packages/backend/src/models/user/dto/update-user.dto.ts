import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional } from 'class-validator';
import { IsAccountIdArray } from 'common/decorators';
import { Role } from 'common/enums/role.enum';
import { AccountIdDto } from 'common/types';

export class UpdateUserDto {
  @ApiProperty({
    example: 'vitalik@ethereum.org',
    description: 'User email.',
  })
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'User name.',
    example: 'Vitalik Buterin',
  })
  name?: string;

  @ApiProperty({
    description: [
      'User acount ids.',
      'List of accounts (wallets) the user has connected to the platform. This list may include accounts in many different networks.',
      'There is no "master" account, all accounts have the same privileges with regard to user permissions.',
    ].join('<br/>'),
    example: [
      {
        chainId: {
          namespace: 'solana',
          reference: 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
        },
        address: '2wmVCSfPxGPjrnMMn7rchp4uaeoTqN39mXFC2zhPdri9',
      },
    ],
  })
  @IsAccountIdArray
  accountIds?: AccountIdDto[];

  @ApiProperty({
    enum: Role,
    description: [
      'User roles.',
      'By default, user is not allowed to interact with anything other than their own profile information.',
    ].join('<br/>'),
    example: ['NFT_ADMIN'],
  })
  roles?: Role[];

  @ApiProperty({
    type: () => Object,
    description: [
      'Discord information.',
      'This property is only present on users that have connected their discord account.',
    ].join('<br/>'),
    example: { id: '364990825698837451', username: 'vitalik#1234' },
  })
  discord?: {
    id: string;
    username: string;
  };
}
