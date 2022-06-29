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
import { AccountIdDto } from 'common/types';
import { Role } from '../enums/role.enum';

@Entity()
@Index(['email'])
export class User {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  name?: string;

  @Column()
  email?: string;

  @Column()
  roles: Role[];

  @Column()
  accountIds: AccountIdDto[];

  @Column()
  discord: {
    id: string;
    username: string;
  };

  @Column()
  avatarUrl?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Nft, (nft) => nft.user)
  nfts: Nft[];
}
