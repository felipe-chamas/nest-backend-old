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
import { Metadata } from '../../models/nft/interface';

@Entity()
@Index(['nftCollectionId'])
export class NftClaim {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  merkleRoot: string;

  @Column()
  merkleProofs: Record<string, { tokens: string; proof: string[] }>;

  @Column()
  metadata: Metadata;

  @Column()
  nftCollectionId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
