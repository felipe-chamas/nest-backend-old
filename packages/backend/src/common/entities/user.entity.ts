import { Nft } from './nft.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ObjectID,
  ObjectIdColumn,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { AccountIdDto, SocialAccounts } from 'common/types';
import { Role } from '../enums/role.enum';
import {
  ApiPropertyAvatarUrl,
  ApiPropertyCreatedAt,
  ApiPropertyDeletedAt,
  ApiPropertyUpdatedAt,
  ApiPropertyUserAccountIds,
  ApiPropertyUserSocialAccounts,
  ApiPropertyUserEmail,
  ApiPropertyUserId,
  ApiPropertyUserName,
  ApiPropertyUserNfts,
  ApiPropertyUserRoles,
} from 'common/decorators/docs.decorators';

@Entity()
@Index(['email'])
export class User {
  @ObjectIdColumn()
  @ApiPropertyUserId()
  id: ObjectID;

  @Column()
  @ApiPropertyUserName()
  name?: string;

  @Column()
  @ApiPropertyUserEmail()
  email?: string;

  @Column()
  @ApiPropertyUserRoles()
  roles: Role[];

  @Column()
  @ApiPropertyUserAccountIds()
  accountIds: AccountIdDto[];

  @Column()
  venlyWalletId?: string;

  @Column()
  @ApiPropertyUserSocialAccounts()
  socialAccounts?: SocialAccounts;

  @Column()
  @ApiPropertyAvatarUrl()
  avatarUrl?: string;

  @CreateDateColumn()
  @ApiPropertyCreatedAt()
  createdAt: Date;

  @UpdateDateColumn()
  @ApiPropertyUpdatedAt()
  updatedAt: Date;

  @DeleteDateColumn()
  @ApiPropertyDeletedAt()
  deletedAt: Date;

  @OneToMany(() => Nft, (nft) => nft.user)
  @ApiPropertyUserNfts()
  nfts: Nft[];
}
