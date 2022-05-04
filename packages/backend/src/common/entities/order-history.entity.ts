import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ObjectID,
  ObjectIdColumn,
} from 'typeorm';

import { Order } from './order.entity';
import { Status } from 'common/types';
import { User } from './user.entity';

@Entity()
export class OrderHistory {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  userId: User['id'];

  @Column()
  orderId: Order['id'];

  @Column()
  currentStatus: Status;

  @Column()
  lastStatus: Status;

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
