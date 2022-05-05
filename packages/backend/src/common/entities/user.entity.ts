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

@Entity()
@Index(['email', 'account'])
export class User {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  name?: string;

  @Column()
  email?: string;

  @Column()
  password: string;

  @Column()
  isAdmin: boolean;

  @Column()
  @Index({ unique: true })
  account: string;

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
