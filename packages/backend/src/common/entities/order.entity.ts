import { Status } from 'common/types';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ObjectID,
  ObjectIdColumn,
} from 'typeorm';

import { Nft } from '../../models/nft';
import { User } from './user.entity';

@Entity()
export class Order {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  status: Status;

  @Column()
  sellerId: User['id'];

  @Column()
  buyerId?: User['id'];

  @Column()
  nftId: Nft['id'];

  @Column()
  price: string;

  @Column()
  fee: string;

  @Column()
  expireAt: Date;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @BeforeInsert()
  expire() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  @BeforeUpdate()
  update() {
    this.updatedAt = new Date();
  }
}
