import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ObjectID,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChainIdDto } from 'common/types';

@Entity()
@Index(['chainId'])
export class Chain {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  chainId: ChainIdDto;

  @Column()
  block: number;

  @Column()
  confirmations: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
