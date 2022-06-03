import { Status } from '../types';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ObjectID,
  ObjectIdColumn,
  UpdateDateColumn,
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
