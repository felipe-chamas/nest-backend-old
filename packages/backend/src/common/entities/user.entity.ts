import { Nft } from './nft.entity';
import {
  BeforeInsert,
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
  isAdmin: boolean;

  @Column()
  accountIds: AccountIdDto[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Nft, (nft) => nft.user)
  nfts: Nft[];

  @BeforeInsert()
  setIsAdmin() {
    this.isAdmin = this.isAdmin || false;
  }
}
