import { Nft } from './nft.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  ObjectID,
  ObjectIdColumn,
  OneToMany,
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

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @OneToMany(() => Nft, (nft) => nft.user)
  nfts: Nft[];

  @BeforeInsert()
  insert() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  @BeforeUpdate()
  update() {
    this.updatedAt = new Date();
  }

  @BeforeInsert()
  setIsAdmin() {
    this.isAdmin = this.isAdmin || false;
  }
}
