import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ObjectID,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Order } from './order.entity';
import { Status } from '../types';
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
